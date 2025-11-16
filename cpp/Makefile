CXX = emcc
SOURCES = algorithms/sudoku_solver.cpp
OUTPUT_DIR = ../wasm
BUILD_DIR = build

CXXFLAGS = -std=c++17 -O3
EMFLAGS = -s WASM=1 \
          -s "EXPORTED_RUNTIME_METHODS=[\"ccall\",\"cwrap\",\"HEAP8\",\"HEAPU8\",\"writeArrayToMemory\"]" \
          -s ALLOW_MEMORY_GROWTH=1 \
          -s MODULARIZE=1 \
          -s EXPORT_NAME="createModule" \
          -s "EXPORTED_FUNCTIONS=[\"_solve_sudoku\",\"_malloc\",\"_free\"]" \
          --bind

OUTPUT = $(OUTPUT_DIR)/sudoku_solver.js
WASM = $(OUTPUT_DIR)/sudoku_solver.wasm

.PHONY: all clean

all: $(OUTPUT)

$(OUTPUT): $(SOURCES)
	@if not exist "$(OUTPUT_DIR)" mkdir "$(OUTPUT_DIR)"
	@if not exist "$(BUILD_DIR)" mkdir "$(BUILD_DIR)"
	$(CXX) $(CXXFLAGS) $(EMFLAGS) $(SOURCES) -o $(OUTPUT)

clean:
	@if exist "$(BUILD_DIR)" rmdir /s /q "$(BUILD_DIR)"
	@if exist "$(OUTPUT_DIR)\*.js" del /q "$(OUTPUT_DIR)\*.js"
	@if exist "$(OUTPUT_DIR)\*.wasm" del /q "$(OUTPUT_DIR)\*.wasm"