# Test Automation Suite

A comprehensive TypeScript Cucumber test suite for black box testing of the Java Spring Boot User API. This test suite is completely isolated from the Java application and communicates exclusively through HTTP API calls.

## 📁 Project Structure

```
test-automation/
├── features/                     # Gherkin feature files
│   ├── user-management.feature   # User CRUD operations tests
│   └── actuator-monitoring.feature # Spring Boot Actuator endpoints tests
├── step-definitions/             # TypeScript step implementations
│   ├── user-steps.ts            # User management step definitions
│   └── actuator-steps.ts        # Actuator monitoring step definitions
├── support/                     # Test utilities and configuration
│   ├── builders/                # Builder pattern for test utilities
│   │   ├── base-builder.ts      # Abstract base builder with retry logic
│   │   └── test-helper-builder.ts # Test utilities and cleanup helpers
│   ├── api-gateway.ts           # Main API client facade
│   ├── enhanced-types.ts        # Type definitions and interfaces
│   ├── hooks.ts                 # Cucumber hooks for setup/teardown
│   ├── types.ts                 # Additional type definitions
│   └── world.ts                 # Cucumber World context
├── generated/                   # Auto-generated API client code
│   ├── api.ts                   # Generated API client from OpenAPI spec
│   └── docs/                    # Generated API documentation
├── reports/                     # Test execution reports
│   ├── cucumber_report.html     # Human-readable HTML report
│   ├── cucumber_report.json     # Machine-readable JSON report
│   └── cucumber_report.xml      # JUnit XML for CI/CD integration
├── cucumber.js                  # Cucumber configuration profiles
├── package.json                 # NPM dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🧪 Testing Philosophy

This test suite follows **black box testing** principles:

- **Zero Internal Knowledge**: Tests have no access to Java application internals
- **HTTP-Only Communication**: All interactions happen through REST API endpoints  
- **Contract Validation**: Tests focus on API contract compliance, not implementation
- **Environment Isolation**: Tests can run against any environment hosting the API
- **Test Data Management**: Complete control over test data lifecycle

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Java Spring Boot application running on `http://localhost:8080`

### Installation
```bash
cd test-automation
npm install
```

### Running Tests
```bash
# Run all tests with full reporting
npm test

# Run with minimal output (development)
npm run test:dev

# Run with CI-friendly output and retry logic
npm run test:ci

# Build TypeScript without running tests
npm run build

# Clean generated files and build artifacts
npm run clean
```

## 📝 Writing New Tests

### 1. Creating Feature Files

Feature files use Gherkin syntax and should be placed in the `features/` directory:

```gherkin
Feature: New Feature Name
  As a [role]
  I want to [capability]
  So that [benefit]

  Background:
    Given the User API is running
    And the database is clean

  Scenario: Test scenario description
    Given some precondition
    When I perform an action
    Then I should see expected result
```

### 2. Implementing Step Definitions

Create corresponding step definitions in `step-definitions/` directory:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

Given('some precondition', async function(this: CustomWorld) {
  // Implementation using this.apiGateway or this.apiClient
});

When('I perform an action', async function(this: CustomWorld) {
  this.response = await this.apiClient.someOperation();
});

Then('I should see expected result', function(this: CustomWorld) {
  assert(this.response?.status === 200, 'Expected successful response');
});
```

### 3. Using Data Tables

Cucumber data tables provide structured test data:

```gherkin
Given I have user data:
  | name     | email           | bio              |
  | John Doe | john@example.com| Software Engineer|
```

```typescript
Given('I have user data:', function(this: CustomWorld, dataTable) {
  const userData = dataTable.hashes()[0];
  this.userData = {
    name: userData.name,
    email: userData.email,
    bio: userData.bio
  };
});
```

## 🏗️ Test Helper Builder

The test suite uses a TestHelperBuilder for test lifecycle management and utilities.

### TestHelperBuilder Features

The `TestHelperBuilder` provides test-specific functionality:

- **Test Data Management**: Create and cleanup test users
- **Wait Conditions**: Wait for application health, user existence, etc.
- **Database State**: Verify and inspect database state
- **Retry Logic**: Automatic retries for transient failures
- **Error Handling**: Consistent error response formatting

```typescript
// Wait for application to be healthy
await testHelpers.waitForHealthy(30000);

// Create test users with templates
const users = await testHelpers.createTestUsers(5, {
  name: 'Test User',
  email: 'test@example.com'
});

// Clean up specific test users
await testHelpers.cleanupTestUsers([1, 2, 3]);

// Wait for specific conditions
await testHelpers.waitForUserExists(userId);
await testHelpers.waitForUserCount(expectedCount);
```

## 🌍 World Context

The `CustomWorld` class maintains test state and provides API access:

### Key Properties
- `response`: Last API response
- `currentUser`: Currently active user for test
- `createdUsers`: Users created during test (auto-cleanup)
- `userData`: Current user data for operations
- `apiGateway`: Modern API client
- `apiClient`: Legacy compatibility layer

### Test Lifecycle Management
```typescript
// Automatic cleanup of test data
this.addCreatedUser(user); // Tracks for cleanup

// Setup test scenario
await this.setupTestScenario('scenario-name');

// Teardown and cleanup
await this.teardownTestScenario();
```

## 🔧 Configuration

### Test Profiles

Configure different execution modes in `cucumber.js`:

- **default**: Full reporting (JSON + HTML)
- **dev**: Minimal progress output
- **ci**: CI/CD friendly with XML reports and retry logic

### Environment Variables

```bash
API_BASE_URL=http://localhost:8080  # API endpoint
NODE_ENV=test                       # Environment mode
```

### TypeScript Configuration

The `tsconfig.json` is optimized for:
- ES2020 target with Node.js compatibility
- Strict type checking
- Path resolution for clean imports
- Source map generation for debugging

## 🔄 API Client Generation

The test suite uses OpenAPI code generation for type-safe API clients:

```bash
# Regenerate API client from OpenAPI spec
npm run generate:api

# This updates the generated/ directory with:
# - Type definitions
# - API client methods  
# - Documentation
```

## 📊 Test Reporting

### Report Types

1. **HTML Report** (`cucumber_report.html`)
   - Human-readable test results
   - Screenshots and error details
   - Pass/fail statistics

2. **JSON Report** (`cucumber_report.json`)
   - Machine-readable test data
   - Integration with test dashboards
   - Detailed timing information

3. **JUnit XML** (`cucumber_report.xml`)
   - CI/CD pipeline integration
   - Compatible with Jenkins, GitHub Actions, etc.

### Report Analysis

```typescript
// Example of accessing test results programmatically
const results = JSON.parse(fs.readFileSync('reports/cucumber_report.json'));
const passRate = calculatePassRate(results);
```

## 🛠️ Extending the Test Suite

### Adding New Endpoints

1. Update OpenAPI specification (`../openapi.yaml`)
2. Regenerate API client: `npm run generate:api`
3. Create builder class extending `BaseBuilder`
4. Add step definitions for new operations
5. Write feature files using new steps

### Adding Test Utilities

Extend `TestHelperBuilder` for additional test utilities:

```typescript
// Add new methods to TestHelperBuilder class
async waitForCustomCondition(condition: () => Promise<boolean>): Promise<boolean> {
  return this.waitForCondition(condition, 30000, 1000, 'custom condition');
}

async createTestUserWithDefaults(overrides?: Partial<UserCreateRequest>): Promise<UserResponse> {
  const defaultUser = { name: 'Test User', email: 'test@example.com' };
  const response = await this.executeWithRetry(() => 
    axios.post('/api/users', { ...defaultUser, ...overrides }, this.config)
  );
  return response.data;
}
```

### Custom Assertions

Create reusable assertion helpers:

```typescript
export function assertValidUser(user: UserResponse) {
  assert(user.id, 'User should have an ID');
  assert(user.name && user.name.length > 1, 'User name should be valid');
  assert(user.email && user.email.includes('@'), 'User email should be valid');
}
```

## 🚨 Best Practices

### Test Design
- **Independent Tests**: Each scenario should be self-contained
- **Data Cleanup**: Always clean up test data in teardown
- **Meaningful Names**: Use descriptive scenario and step names
- **Error Scenarios**: Test both success and failure paths

### Code Organization
- **Single Responsibility**: Each builder handles one API domain
- **Type Safety**: Leverage TypeScript for compile-time checks
- **DRY Principle**: Reuse common operations through builders
- **Documentation**: Document complex business logic

### Performance
- **Parallel Execution**: Use Cucumber's parallel features when possible
- **Test Data Efficiency**: Minimize database operations
- **Connection Pooling**: Reuse HTTP connections
- **Selective Testing**: Use tags to run specific test subsets

## 🏷️ Test Tags and Organization

Use Cucumber tags to organize and filter tests:

```gherkin
@api @users @smoke
Scenario: Create user successfully
  # Test implementation

@api @users @regression  
Scenario: Handle invalid user data
  # Test implementation
```

```bash
# Run only smoke tests
npx cucumber-js --tags "@smoke"

# Run API tests excluding slow tests
npx cucumber-js --tags "@api and not @slow"
```

## 🔍 Debugging and Troubleshooting

### Common Issues

1. **API Not Running**: Ensure Spring Boot app is on port 8080
2. **Test Data Conflicts**: Check database cleanup in Background steps
3. **Timeout Errors**: Increase timeout in builder configuration
4. **Type Errors**: Regenerate API client after schema changes

### Debug Mode

```bash
# Enable debug logging
DEBUG=cucumber:* npm test

# Run single feature file
npx cucumber-js features/user-management.feature

# Run specific scenario by line number
npx cucumber-js features/user-management.feature:15
```

## 📚 Dependencies

### Core Testing Framework
- `@cucumber/cucumber`: ^12.1.0 - BDD testing framework
- `typescript`: ^5.9.2 - TypeScript compiler
- `ts-node`: ^10.9.1 - TypeScript execution engine

### API Client
- `axios`: ^1.6.2 - HTTP client library
- `@openapitools/openapi-generator-cli`: ^2.23.0 - API client generation

### Utilities
- `concurrently`: ^9.2.0 - Run multiple commands
- `wait-on`: ^8.0.4 - Wait for services to be ready
- `rimraf`: ^6.0.1 - Cross-platform file cleanup

## 🤝 Contributing

1. **Feature Branches**: Create feature branches for new test suites
2. **Code Review**: All changes require peer review
3. **Test Coverage**: Ensure new features have corresponding tests
4. **Documentation**: Update README for new builders or patterns
5. **Backward Compatibility**: Maintain existing test compatibility

---

This test suite provides a robust foundation for API testing with TypeScript and Cucumber, emphasizing maintainability, type safety, and comprehensive test coverage.