# Makefile for Java Spring Boot + TypeScript Cucumber Testing
# Provides clean interface for running tests with Docker Compose

.PHONY: help test test-docker clean build logs status down up-detached debug-wiremock

# Default target
help: ## Show this help message
	@echo "Java Spring Boot + TypeScript Cucumber Test Suite"
	@echo "=================================================="
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Main test command - runs full Docker stack with Cucumber tests
test: ## Run Cucumber tests with Docker Compose (PostgreSQL + WireMock)
	@echo "🚀 Starting full test suite with Docker Compose..."
	@echo "   - PostgreSQL database"
	@echo "   - WireMock service for external dependencies"  
	@echo "   - Spring Boot application"
	@echo "   - TypeScript Cucumber tests"
	@echo ""
	docker compose up --build --abort-on-container-exit --exit-code-from tests
	@echo ""
	@echo "✅ Test suite completed. Check test-automation/reports/ for detailed results."

# Alternative Docker test command for development
test-docker: test ## Alias for 'make test' (Docker Compose mode)

# Build all Docker images without running tests
build: ## Build Docker images for all services
	@echo "🔨 Building Docker images..."
	docker compose build

# Start services in detached mode for debugging
up-detached: ## Start all services in background (useful for debugging)
	@echo "🎯 Starting services in detached mode..."
	docker compose up --build -d
	@echo ""
	@echo "Services running in background:"
	@echo "  - App:      http://localhost:8080"
	@echo "  - WireMock: http://localhost:8081"
	@echo "  - H2 Console: http://localhost:8080/h2-console (local mode)"
	@echo ""
	@echo "Run 'make down' to stop services"
	@echo "Run 'make logs' to view logs"
	@echo "Run 'make status' to check health"

# Stop all services
down: ## Stop and remove all Docker containers
	@echo "⛔ Stopping all services..."
	docker compose down --volumes

# View logs from all services
logs: ## Show logs from all services
	docker compose logs -f

# Show status of all services
status: ## Show status of all Docker services
	@echo "📊 Service Status:"
	@echo "=================="
	docker compose ps
	@echo ""
	@echo "🔍 Health Checks:"
	@echo "=================="
	@if docker compose ps | grep -q "Up"; then \
		echo "Checking application health..."; \
		curl -s http://localhost:8080/actuator/health | grep -o '"status":"[^"]*"' || echo "App not responding"; \
		echo "Checking WireMock admin endpoint..."; \
		curl -s http://localhost:8081/__admin/ >/dev/null && echo "WireMock: Healthy" || echo "WireMock: Not responding"; \
	else \
		echo "No services are currently running"; \
	fi

# Debug WireMock issues
debug-wiremock: ## Debug WireMock container issues
	@echo "🔍 Debugging WireMock container..."
	@echo "=================================="
	@echo "Container status:"
	docker compose ps wiremock
	@echo ""
	@echo "Container logs (last 20 lines):"
	docker compose logs --tail=20 wiremock
	@echo ""
	@echo "Testing WireMock endpoints:"
	@echo "Admin endpoint: http://localhost:8081/__admin/"
	@curl -s -w "Status: %{http_code}\n" http://localhost:8081/__admin/ || echo "Failed to connect"
	@echo ""
	@echo "Mappings directory contents:"
	@ls -la test-automation/wiremock-mappings/ || echo "Directory not found"

# Clean up everything (containers, images, volumes)
clean: ## Remove all Docker containers, images, and volumes
	@echo "🧹 Cleaning up Docker resources..."
	@echo "⚠️  This will remove all containers, images, and volumes!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down --volumes --rmi all; \
		docker system prune -f; \
		echo "✅ Cleanup completed"; \
	else \
		echo "❌ Cleanup cancelled"; \
	fi

# Quick test run with rebuild (useful during development)
test-rebuild: ## Force rebuild and run tests (useful during development)
	@echo "🔄 Forcing rebuild and running tests..."
	docker compose down --volumes
	docker compose build --no-cache
	$(MAKE) test

# Run only specific test scenarios (requires FEATURE argument)
test-feature: ## Run specific feature file (usage: make test-feature FEATURE=user-management)
	@if [ -z "$(FEATURE)" ]; then \
		echo "❌ Please specify FEATURE. Example: make test-feature FEATURE=user-management"; \
		echo "Available features:"; \
		ls test-automation/features/*.feature | xargs -n 1 basename -s .feature | sed 's/^/  - /'; \
	else \
		echo "🎯 Running feature: $(FEATURE)"; \
		docker compose run --rm tests npm test -- --name "$(FEATURE)"; \
	fi

# Generate test reports (if tests have been run)
reports: ## Open test reports in browser (after running tests)
	@echo "📊 Opening test reports..."
	@if [ -f "test-automation/reports/cucumber-report.html" ]; then \
		if command -v xdg-open >/dev/null 2>&1; then \
			xdg-open test-automation/reports/cucumber-report.html; \
		elif command -v open >/dev/null 2>&1; then \
			open test-automation/reports/cucumber-report.html; \
		else \
			echo "Please open test-automation/reports/cucumber-report.html in your browser"; \
		fi; \
	else \
		echo "❌ No test reports found. Run 'make test' first."; \
	fi

# Development helpers
dev-start: up-detached ## Start services for development (alias for up-detached)

dev-stop: down ## Stop development services (alias for down)

dev-logs: ## Show logs with timestamps (better for development)
	docker compose logs -f -t

# Information targets
info: ## Show project information and useful URLs
	@echo "📋 Project Information"
	@echo "======================"
	@echo "Project: Java Spring Boot + TypeScript Cucumber Tests with WireMock"
	@echo "Architecture: Microservice testing with external service mocking"
	@echo ""
	@echo "🌐 Service URLs (when running):"
	@echo "  Application:     http://localhost:8080"
	@echo "  API Endpoints:   http://localhost:8080/api/users"
	@echo "  Health Check:    http://localhost:8080/actuator/health"
	@echo "  WireMock Admin:  http://localhost:8081/__admin"
	@echo "  WireMock API:    http://localhost:8081/api/profile/validate"
	@echo ""
	@echo "📁 Important Directories:"
	@echo "  Java Code:       src/main/java/"
	@echo "  Test Features:   test-automation/features/"
	@echo "  Test Reports:    test-automation/reports/"
	@echo "  WireMock Stubs:  test-automation/wiremock-mappings/"
	@echo ""
	@echo "🔧 Quick Commands:"
	@echo "  make test        # Run full test suite"
	@echo "  make up-detached # Start services for debugging"
	@echo "  make logs        # View service logs"
	@echo "  make clean       # Clean up everything"

# CI/CD friendly test command with proper exit codes
test-ci: ## Run tests for CI/CD (with proper exit codes and no TTY)
	@echo "🤖 Running tests in CI mode..."
	docker compose up --build --abort-on-container-exit --exit-code-from tests --no-log-prefix
	@exit_code=$$?; \
	if [ $$exit_code -eq 0 ]; then \
		echo "✅ All tests passed"; \
	else \
		echo "❌ Tests failed with exit code $$exit_code"; \
	fi; \
	exit $$exit_code