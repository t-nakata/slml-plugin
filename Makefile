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

# Help target
help:
	@echo "Available targets:"
	@echo "  all       - Build all TypeScript files (default)"
	@echo "  build     - Build specific TypeScript files in dependency order"
	@echo "  clean     - Remove all generated JavaScript files"
	@echo "  help      - Display this help message"

.PHONY: all build clean help
