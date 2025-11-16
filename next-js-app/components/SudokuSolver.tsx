'use client';

import { useState } from 'react';
import { useWasm } from '../hooks/useWasm';

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

  if (loading) {
    return <div className="p-8">Loading WebAssembly module...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading WASM: {error.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Sudoku Solver</h1>
      
      <div className="grid grid-cols-9 gap-1 max-w-md mx-auto mb-6 border-2 border-gray-800 p-1 bg-white">
        {board.map((cell, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={cell === '.' ? '' : cell}
            onChange={(e) => updateCell(index, e.target.value)}
            className="w-10 h-10 text-center border border-gray-300 focus:border-blue-500 focus:outline-none text-lg font-semibold text-gray-900"
            style={{
              backgroundColor: cell !== '.' ? '#e0f2fe' : 'white',
              color: '#111827',
              fontWeight: '600',
            }}
          />
        ))}
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={solveSudoku}
          disabled={!module || solving}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {solving ? 'Solving...' : 'Solve'}
        </button>
        <button
          onClick={resetBoard}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
}