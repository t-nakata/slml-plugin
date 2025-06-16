# Makefile for SLML Plugin

# TypeScript compiler
TSC = tsc

# Source TypeScript files
TS_FILES = $(wildcard *.ts)

# Output JavaScript files
JS_FILES = $(TS_FILES:.ts=.js)

# Specific TypeScript files in dependency order
SPECIFIC_TS_FILES = parser.ts icons.ts renderer.ts

# Default target
all: $(JS_FILES)

# Build specific files in order
build: 
	@echo "Building SLML Plugin..."
	@for file in $(SPECIFIC_TS_FILES); do \
		echo "Compiling $$file..."; \
		$(TSC) --target ES2020 --module ES2020 --moduleResolution node $$file; \
		echo "Done compiling $$file"; \
	done
	@echo "Build complete!"

# Rule to compile TypeScript files to JavaScript
%.js: %.ts
	@echo "Compiling $< to $@..."
	$(TSC) --target ES2020 --module ES2020 --moduleResolution node $<
	@echo "Done compiling $@"

# Clean generated files
clean:
	rm -f $(JS_FILES)

# Linting
lint:
	@echo "Linting TypeScript files..."
	npx eslint --ext .ts .

# Lint and fix
lint-fix:
	@echo "Linting and fixing TypeScript files..."
	npx eslint --ext .ts . --fix

# CI target
ci: lint build
	@echo "CI checks completed successfully!"

# Help target
help:
	@echo "Available targets:"
	@echo "  all       - Build all TypeScript files (default)"
	@echo "  build     - Build specific TypeScript files in dependency order"
	@echo "  clean     - Remove all generated JavaScript files"
	@echo "  lint      - Run ESLint on TypeScript files"
	@echo "  lint-fix  - Run ESLint and fix issues automatically"
	@echo "  ci        - Run linting and build (for CI/CD)"
	@echo "  help      - Display this help message"

.PHONY: all build clean lint lint-fix ci help
