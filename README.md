# Java Spring Boot + TypeScript Cucumber Black Box Testing Demo

This project demonstrates how to perform **black box testing** of a Java 17 Spring Boot 3.5 application using TypeScript and Cucumber.js. The TypeScript tests treat the Java application as an external system, testing only through HTTP API endpoints without any knowledge of the internal implementation.

## 🏗️ Project Structure

```
├── src/main/java/                    # Java Spring Boot Application
│   └── com/example/demo/
│       ├── controller/               # REST Controllers
│       ├── service/                  # Business Logic
│       ├── model/                    # JPA Entities
│       ├── repository/               # Data Access Layer
│       ├── dto/                      # Data Transfer Objects
│       └── exception/                # Exception Handling
├── src/test/java/                    # Java Unit Tests
├── test-automation/                  # TypeScript Cucumber Tests
│   ├── features/                     # Gherkin Feature Files
│   ├── step-definitions/             # TypeScript Step Implementations
│   ├── support/                      # Test Utilities & Configuration
│   └── reports/                      # Test Reports Output
├── pom.xml                          # Maven Configuration
├── run-tests.sh                     # Test Execution Script
└── README.md                        # This File
```

## 🎯 What This Demonstrates

### Java Spring Boot Application Features
- **Java 17** with **Spring Boot 3.5.x**
- RESTful API with full CRUD operations
- **Spring Boot Actuator** for monitoring and management
- JPA/Hibernate with H2 in-memory database
- Bean validation with custom error handling
- Global exception handling
- Multiple application profiles (dev, test)

### TypeScript Cucumber Testing Features
- **Black box testing** approach - no internal code knowledge
- **Behavior-Driven Development (BDD)** with Gherkin scenarios
- **TypeScript** for type safety and better maintainability
- **OpenAPI Code Generation** - types and clients generated from OpenAPI spec
  - Single source of truth for API contracts
  - Automatic TypeScript type generation
  - Built-in compatibility with existing test code
  - Centralized ApiGateway architecture combining generated and custom clients
- Comprehensive API testing covering:
  - Happy path scenarios
  - Error conditions
  - Edge cases
  - Validation testing
  - Actuator monitoring endpoints
- Automatic test reporting (JSON, HTML, JUnit XML)
- Test environment management

## 🚀 Quick Start

### Prerequisites
- **Java 17** or higher
- **Maven 3.6** or higher
- **Node.js 18** or higher
- **npm** or **yarn**

### 1. Clone and Setup
```bash
git clone <repository-url>
cd java-app-typescript-cucumber
```

### 2. Run Everything with One Command
```bash
./run-tests.sh
```

This script will:
1. Build and start the Spring Boot application
2. Install npm dependencies
3. Run all Cucumber tests
4. Generate test reports
5. Clean up processes

### 3. Manual Step-by-Step Execution

#### Start the Java Application
```bash
# Build and run the Spring Boot app
mvn clean spring-boot:run

# Application will be available at http://localhost:8080
# H2 Console available at http://localhost:8080/h2-console
# Actuator endpoints available at http://localhost:8080/actuator
```

#### Run the TypeScript Tests
```bash
cd test-automation

# Install dependencies
npm install

# Run tests
npm test

# Run with different profiles
npm run test:dev    # Development mode (minimal output)
npm run test:ci     # CI mode (with JUnit XML reports)
```

## 📋 API Endpoints

### User Management API
The Spring Boot application exposes the following REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/users` | Get all users |
| GET    | `/api/users/{id}` | Get user by ID |
| POST   | `/api/users` | Create new user |
| PUT    | `/api/users/{id}` | Update existing user |
| DELETE | `/api/users/{id}` | Delete user |

### Spring Boot Actuator Endpoints
Monitoring and management endpoints available at `/actuator`:

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Application health status and component checks |
| `/actuator/info` | Application information and build details |
| `/actuator/metrics` | Application metrics and performance data |
| `/actuator/env` | Environment properties and configuration |
| `/actuator/beans` | Spring beans and their dependencies |
| `/actuator/mappings` | Request mappings and handler methods |
| `/actuator/configprops` | Configuration properties |
| `/actuator/loggers` | Logger configuration and levels |
| `/actuator/threaddump` | Thread dump for debugging |
| `/actuator/heapdump` | Heap dump for memory analysis |

### Sample User Object
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Software developer"
}
```

## 🧪 Test Scenarios

The Cucumber tests cover comprehensive scenarios including:

### User API Testing
- **Happy Path Testing**: Creating, retrieving, updating, and deleting users
- **Error Condition Testing**: Invalid input validation, duplicate handling, non-existent resources
- **Edge Cases**: Empty database scenarios, boundary values, data consistency

### Actuator Monitoring Testing  
- **Health Checks**: Application and component health status verification
- **Metrics Validation**: JVM metrics, HTTP request metrics, database connection pools
- **Information Endpoints**: Application metadata and build information
- **Management Endpoints**: Configuration, beans, mappings, and environment data

## 📊 Test Reporting

After running tests, reports are generated in `test-automation/reports/`:

- **cucumber_report.html** - Human-readable HTML report with scenarios and steps
- **cucumber_report.json** - Machine-readable JSON format for CI/CD integration
- **cucumber_report.xml** - JUnit XML format for CI/CD systems

## 🔧 Configuration

### Spring Boot Profiles
- **default** - Standard configuration with H2 database
- **dev** - Development mode with SQL logging enabled
- **test** - Test configuration for automated testing

### Test Configuration
Modify `test-automation/cucumber.js` to customize:
- Test execution parallelization
- Report formats and locations
- Retry strategies
- Test filtering

### Environment Variables
- `API_BASE_URL` - Override default API URL (default: http://localhost:8080)

## 🏆 Key Benefits of This Approach

### Black Box Testing Advantages
1. **Technology Independence** - Tests can remain stable even if internal implementation changes
2. **Real-world Simulation** - Tests how external clients would actually interact with the API
3. **Contract Testing** - Validates the API contract without implementation details
4. **Deployment Confidence** - Tests the full application stack as deployed

### BDD with Cucumber Benefits
1. **Living Documentation** - Feature files serve as executable specifications
2. **Stakeholder Communication** - Non-technical stakeholders can understand test scenarios
3. **Test Maintainability** - Step definitions can be reused across multiple scenarios
4. **Clear Intent** - Tests clearly express business requirements

### TypeScript Advantages
1. **Type Safety** - Catch errors at compile time
2. **Better IDE Support** - Enhanced code completion and refactoring
3. **Maintainability** - Easier to maintain and refactor test code
4. **Team Productivity** - Familiar syntax for developers coming from Java

## 🔍 Extending the Tests

### Adding New Test Scenarios
1. Create or modify `.feature` files in `test-automation/features/`
2. Implement corresponding step definitions in `step-definitions/`
3. Use the existing API client utilities in `support/`

### Adding New API Endpoints
1. Extend the `ApiClient` class with new methods
2. Add corresponding TypeScript interfaces in `types.ts`
3. Create new feature files and step definitions

### Integration with CI/CD
The project is designed for easy CI/CD integration:
- JUnit XML reports for test result visualization
- JSON reports for programmatic analysis
- Exit codes for pass/fail determination
- Dockerizable components

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)

## 🤝 Contributing

This is a demonstration project. Feel free to:
- Add more complex test scenarios
- Implement additional API endpoints
- Enhance error handling and validation
- Improve test utilities and reporting

---

**Note**: This project demonstrates black box testing principles where the TypeScript tests have no knowledge of the Java application's internal structure, database schema, or business logic implementation. All interactions happen through the public HTTP API, simulating how real external clients would use the system.