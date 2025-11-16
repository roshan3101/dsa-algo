'use client';

import { useState } from 'react';
import { useWasm } from '../hooks/useWasm';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, RotateCcw, Play } from 'lucide-react';

export default function SudokuSolver() {
  const { module, loading, error } = useWasm();
  const [board, setBoard] = useState<string[]>(Array(81).fill('.'));
  const [solving, setSolving] = useState(false);

  const solveSudoku = () => {
    if (!module) return;

    setSolving(true);
    
    try {
      // Convert board to C array
      const boardArray = new Uint8Array(81);
      for (let i = 0; i < 81; i++) {
        boardArray[i] = board[i].charCodeAt(0);
      }
      
      // Access module functions
      const malloc = module._malloc;
      const free = module._free;
      const solveFunc = module._solve_sudoku;
      
      if (!malloc || !free || !solveFunc) {
        console.error('Module structure:', module);
        throw new Error('WASM module functions not found. Available keys: ' + Object.keys(module).join(', '));
      }
      
      // Access memory - try HEAP8, HEAPU8, or create from memory buffer
      let heap8 = module.HEAP8;
      let heapu8 = module.HEAPU8;
      
      // If HEAP8 is not available, try to access through memory
      if (!heap8) {
        // Try to get memory from module
        const memory = (module as any).wasmMemory || (module as any).memory;
        if (memory && memory.buffer) {
          heapu8 = new Uint8Array(memory.buffer);
          heap8 = new Int8Array(memory.buffer);
        } else {
          throw new Error('Could not access WASM memory. Available keys: ' + Object.keys(module).join(', '));
        }
      }
      
      // Use writeArrayToMemory if available, otherwise use HEAP8/HEAPU8
      const ptr = malloc(81);
      
      if (module.writeArrayToMemory) {
        module.writeArrayToMemory(boardArray, ptr);
      } else if (heapu8) {
        heapu8.set(boardArray, ptr);
      } else if (heap8) {
        heap8.set(boardArray, ptr);
      } else {
        free(ptr);
        throw new Error('Could not write to WASM memory');
      }
      
      // Call C function
      solveFunc(ptr, 81);
      
      // Read result back
      const result: string[] = [];
      for (let i = 0; i < 81; i++) {
        const byte = heapu8 ? heapu8[ptr + i] : (heap8[ptr + i] & 0xFF);
        result.push(String.fromCharCode(byte));
      }
      
      // Free memory
      free(ptr);
      
      setBoard(result);
    } catch (err) {
      console.error('Error solving sudoku:', err);
      alert('Error: ' + (err as Error).message);
    } finally {
      setSolving(false);
    }
  };

  const updateCell = (index: number, value: string) => {
    const newBoard = [...board];
    // Only allow digits 1-9, limit to single character
    const sanitized = value.replace(/[^1-9]/g, '').slice(0, 1);
    newBoard[index] = sanitized === '' ? '.' : sanitized;
    setBoard(newBoard);
  };

  const resetBoard = () => {
    setBoard(Array(81).fill('.'));
  };

  // Helper function to get 3x3 box borders
  const getBoxBorders = (index: number) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    const borders = [];
    // Top border for first row of each 3x3 box (rows 0, 3, 6)
    if (row % 3 === 0 && row > 0) borders.push('border-t-2 border-t-brand-purple-500/40');
    // Bottom border for last row of each 3x3 box (rows 2, 5, 8)
    if (row % 3 === 2 && row < 8) borders.push('border-b-2 border-b-brand-purple-500/40');
    // Left border for first column of each 3x3 box (cols 0, 3, 6)
    if (col % 3 === 0 && col > 0) borders.push('border-l-2 border-l-brand-purple-500/40');
    // Right border for last column of each 3x3 box (cols 2, 5, 8)
    if (col % 3 === 2 && col < 8) borders.push('border-r-2 border-r-brand-purple-500/40');
    
    return borders.join(' ');
  };

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple-500 mb-4" />
          <p className="text-muted-foreground">Loading WebAssembly module...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading WASM</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand-purple-400 to-brand-purple-300 bg-clip-text text-transparent">
          Sudoku Solver
        </CardTitle>
        <CardDescription>
          Enter your Sudoku puzzle and let C++ WebAssembly solve it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sudoku Grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-9 gap-0 border-2 border-brand-purple-500/30 rounded-lg p-1 bg-card shadow-lg">
            {board.map((cell, index) => {
              const isFilled = cell !== '.';
              const row = Math.floor(index / 9);
              const col = index % 9;
              
              return (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={cell === '.' ? '' : cell}
                  onChange={(e) => updateCell(index, e.target.value)}
                    className={`
                    w-11 h-11 sm:w-12 sm:h-12
                    text-center
                    border border-border
                    focus:border-brand-purple-500 focus:ring-2 focus:ring-brand-purple-500/20
                    focus:outline-none
                    text-lg sm:text-xl font-bold
                    transition-all duration-200
                    ${getBoxBorders(index)}
                    ${isFilled 
                      ? 'bg-brand-purple-500/10 text-brand-purple-400 dark:text-brand-purple-300' 
                      : 'bg-background text-foreground'
                    }
                    hover:bg-brand-purple-500/5
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  disabled={solving}
                />
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={solveSudoku}
            disabled={!module || solving}
            size="lg"
            className="bg-brand-purple-500 hover:bg-brand-purple-600 text-white shadow-lg shadow-brand-purple-500/30"
          >
            {solving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Solving...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Solve
              </>
            )}
          </Button>
          <Button
            onClick={resetBoard}
            variant="outline"
            size="lg"
            disabled={solving}
            className="border-brand-purple-500/30 hover:bg-brand-purple-500/10 hover:border-brand-purple-500/50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by C++ compiled to WebAssembly</p>
        </div>
      </CardContent>
    </Card>
  );
}