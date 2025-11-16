#include<emscripten.h>
#include<emscripten/bind.h>
#include<vector>
#include<string>


using namespace emscripten;
using namespace std;

class SudokuSolver {
private:

     bool isSafe(vector<vector<char>>& board, int row, int col, int ch) {
        for(int i=0; i<9; i++) {
            if(board[row][i] == ch) return false;
            if(board[i][col] == ch) return false;
            
            int sr = (row / 3) * 3;
            int sc = (col / 3) * 3;
            
            for(int i=0; i<3; i++) {
                for(int j=0; j<3; j++) {
                    if(board[sr+i][sc+j] == ch) return false;
                }
            }
        }
        return true;
    }

    bool backtrack(vector<vector<char>>& board) {
        for(int i=0; i<9; i++) {
            for(int j=0;j<9;j++) {
                if(board[i][j] == '.') {
                    for(char c='1'; c<='9'; c++) {
                        if(isSafe(board,i,j,c)) {
                            board[i][j] = c;
                            if(backtrack(board)) {
                                return true;
                            }
                            board[i][j] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
public:
    void solveSudoku(vector<vector<char>>& board) {
        backtrack(board);
    }
};


EMSCRIPTEN_KEEPALIVE
extern "C" {
    void solve_sudoku(char* board, int size) {
        vector<vector<char>> grid(9, vector<char>(9));
        for(int i=0;i<9;i++) {
            for(int j=0;j<9;j++)
                grid[i][j] = board[i*9 + j];
        }

        SudokuSolver solver;
        solver.solveSudoku(grid);

        for(int i=0;i<9;i++) {
            for(int j=0;j<9;j++)
                board[i*9 + j] = grid[i][j];
        }
    }
}

EMSCRIPTEN_BINDINGS(sudoku_solver) {
    class_<SudokuSolver>("SudokuSolver")
        .constructor<>()
        .function("solveSudoku", &SudokuSolver::solveSudoku);
}