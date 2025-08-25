#!/bin/bash

set -e

echo "🚀 Starting Java Spring Boot + TypeScript Cucumber Test Demo"
echo "============================================================"

# Check if Docker mode is requested
DOCKER_MODE=false
if [ "$1" = "--docker" ] || [ "$1" = "-d" ]; then
    DOCKER_MODE=true
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start the Spring Boot application
start_spring_app() {
    echo "📦 Starting Spring Boot application..."
    if check_port; then
        echo "⚠️  Port 8080 is already in use. Assuming application is already running."
    else
        echo "🔧 Building and starting Spring Boot application..."
        mvn clean spring-boot:run &
        SPRING_PID=$!
        echo "⏳ Waiting for Spring Boot application to start..."
        
        # Wait for the application to be ready (max 2 minutes)
        for i in {1..60}; do
            if check_port; then
                echo "✅ Spring Boot application is ready!"
                break
            fi
            if [ $i -eq 60 ]; then
                echo "❌ Spring Boot application failed to start within 2 minutes"
                exit 1
            fi
            sleep 2
            echo "   Waiting... ($i/60)"
        done
    fi
}

# Function to run TypeScript Cucumber tests
run_tests() {
    echo ""
    echo "🧪 Running TypeScript Cucumber tests..."
    echo "========================================"
    cd test-automation
    
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing npm dependencies..."
        npm install
    fi
    
    echo "🔍 Running Cucumber tests..."
    npm test
    
    echo ""
    echo "📊 Test results:"
    if [ -f "reports/cucumber_report.json" ]; then
        echo "   JSON report: test-automation/reports/cucumber_report.json"
    fi
    if [ -f "reports/cucumber_report.html" ]; then
        echo "   HTML report: test-automation/reports/cucumber_report.html"
    fi
}

# Function to cleanup
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    if [ ! -z "$SPRING_PID" ]; then
        echo "   Stopping Spring Boot application..."
        kill $SPRING_PID 2>/dev/null || true
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main execution
if [ "$DOCKER_MODE" = true ]; then
    echo "🐳 Running in Docker mode..."
    echo "Building and starting services with Docker Compose..."
    
    # Build and run with docker compose
    docker compose down --volumes --remove-orphans 2>/dev/null || true
    docker compose build
    docker compose up --abort-on-container-exit --exit-code-from tests
    
    # Copy test reports from container
    docker compose cp tests:/app/reports ./test-automation/reports 2>/dev/null || echo "No test reports to copy"
    
    # Cleanup
    docker compose down --volumes --remove-orphans
    
    echo ""
    echo "🎉 Docker test execution completed!"
    echo "View the HTML report at: test-automation/reports/cucumber_report.html"
else
    echo "🏠 Running in local mode (H2 with PostgreSQL compatibility)..."
    start_spring_app
    run_tests
    
    echo ""
    echo "🎉 Test execution completed!"
    echo "View the HTML report at: test-automation/reports/cucumber_report.html"
    echo ""
    echo "💡 Tip: Run with --docker flag to use full PostgreSQL setup:"
    echo "   ./run-tests.sh --docker"
fi