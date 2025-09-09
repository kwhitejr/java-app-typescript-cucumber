# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Java 17 Spring Boot 3.5.x application with a separate TypeScript Cucumber test suite that performs black box testing via HTTP API calls. The project demonstrates BDD testing where the TypeScript tests have no knowledge of the Java application's internal implementation.

**Database Setup**: The application supports both local development (H2 in PostgreSQL compatibility mode) and production/CI environments (full PostgreSQL via Docker).

## Architecture

**Java Application (Spring Boot):**
- `src/main/java/com/example/demo/` - Main application code
  - `controller/` - REST API endpoints (`UserController.java`)
  - `service/` - Business logic (`UserService.java`)
  - `model/` - JPA entities (`User.java`)
  - `repository/` - Data access layer (`UserRepository.java`)
  - `dto/` - Data Transfer Objects for API requests/responses
  - `exception/` - Global exception handling
- Database: H2 in PostgreSQL compatibility mode (local) or PostgreSQL (Docker)
- Spring Boot Actuator for monitoring endpoints
- Application runs on port 8080
- Full Docker Compose setup for CI/CD pipelines

**TypeScript Test Suite:**
- `test-automation/` - Completely separate test project
  - `features/` - Gherkin feature files (.feature)
  - `step-definitions/` - TypeScript step implementations
  - `support/` - Test utilities, API client, hooks, world context
- Tests communicate only through HTTP API calls
- Uses Cucumber.js v12.1.0 with TypeScript v5.9.2 for BDD testing

## Development Commands

### Quick Start (Recommended)
```bash
# Run full test suite with Docker Compose (PostgreSQL + WireMock + Cucumber tests)
make test

# Start services for development/debugging
make up-detached

# View service logs
make logs

# Stop all services
make down

# Show all available commands
make help
```

### Java Application
```bash
# Build and run the Spring Boot application
mvn clean spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Build only
mvn clean compile

# Run Java unit tests
mvn test
```

### TypeScript Tests
```bash
cd test-automation

# Install dependencies
npm install

# Run all tests
npm test

# Run with development profile (minimal output)
npm run test:dev

# Run with CI profile (includes JUnit XML reports)
npm run test:ci

# Build TypeScript
npm run build
```

### Full Integration Testing
```bash
# Local mode: H2 with PostgreSQL compatibility (no installation required)
./run-tests.sh

# Docker mode: Full PostgreSQL setup for production-like testing
./run-tests.sh --docker
```

### Docker Development
```bash
# Build and run full stack with PostgreSQL
docker compose up --build

# Run tests only
docker compose up tests

# Clean up
docker compose down --volumes
```

## Key Application Configuration

- **Database (Local)**: H2 in PostgreSQL compatibility mode (`jdbc:h2:mem:testdb;MODE=PostgreSQL`)
- **Database (Docker)**: PostgreSQL 15 (`jdbc:postgresql://postgres:5432/demo`)
- **API Base Path**: `/api/users`
- **Actuator Endpoints**: `/actuator/*` (health, info, metrics, etc.)
- **H2 Console** (Local only): `http://localhost:8080/h2-console` (username: `sa`, password: `password`)
- **Profiles**: default, dev (debug logging + SQL), test, docker (PostgreSQL)

## Testing Approach

This project uses **black box testing** principles:
- TypeScript tests treat the Java app as an external system
- No shared code or direct database access from tests  
- All interactions happen through HTTP API endpoints
- Tests focus on API contract validation, not implementation details
- Test reports generated in `test-automation/reports/`
- Works identically in both local (H2) and Docker (PostgreSQL) modes

## Test Execution Profiles

- **default**: Full reporting (JSON, HTML)
- **dev**: Minimal progress output only
- **ci**: Includes JUnit XML for CI/CD integration, with retry logic

## Dependencies & Versions

**TypeScript Test Suite:**
- `@cucumber/cucumber`: v12.1.0 (latest)
- `typescript`: v5.9.2 (latest)
- `@types/node`: v24.3.0
- `ts-node`: v10.9.1
- `axios`: v1.6.2
- `concurrently`: v9.2.0
- `wait-on`: v8.0.4
- `rimraf`: v6.0.1

## Important Notes

**Local Development:**
- Uses H2 database in PostgreSQL compatibility mode (no PostgreSQL installation needed)
- Application must be running on port 8080 before executing TypeScript tests
- H2 console available at `http://localhost:8080/h2-console`

**Docker/CI Mode:**
- Uses real PostgreSQL database for production-like testing
- Full containerization: app, database, and test runner
- Automatic service orchestration and health checks
- Test reports automatically copied from containers

**General:**
- The `run-tests.sh` script handles the full lifecycle (start app, run tests, cleanup)
- Tests validate both user CRUD operations and Spring Boot Actuator endpoints
- Test reports include human-readable HTML and machine-readable JSON/XML formats
- All dependencies are kept up-to-date with latest stable versions
- Both modes use identical PostgreSQL dialect for maximum compatibility