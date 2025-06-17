# Makefile for DCUI Plugin

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
	@echo "Building DCUI Plugin..."
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

# Release target for Firebase Hosting
release: build
	@echo "Preparing release for Firebase Hosting..."
	@mkdir -p public
	@cp index.html public/
	@cp parser.js public/
	@cp renderer.js public/
	@cp icons.js public/
	@echo "Release preparation complete! Files are in the 'public' directory."

# Firebase login target
login:
	@echo "Logging in to Firebase..."
	firebase login
	@echo "Firebase login complete!"

# Deploy target for Firebase Hosting
deploy: release
	@echo "Deploying to Firebase Hosting..."
	firebase deploy --only hosting
	@echo "Deployment complete!"

# Help target
help:
	@echo "Available targets:"
	@echo "  all       - Build all TypeScript files (default)"
	@echo "  build     - Build specific TypeScript files in dependency order"
	@echo "  clean     - Remove all generated JavaScript files"
	@echo "  lint      - Run ESLint on TypeScript files"
	@echo "  lint-fix  - Run ESLint and fix issues automatically"
	@echo "  ci        - Run linting and build (for CI/CD)"
	@echo "  release   - Prepare files for Firebase Hosting deployment"
	@echo "  login     - Login to Firebase"
	@echo "  deploy    - Deploy to Firebase Hosting"
	@echo "  help      - Display this help message"

.PHONY: all build clean lint lint-fix ci release login deploy help
