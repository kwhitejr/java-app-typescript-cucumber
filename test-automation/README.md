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

## 🌍 Cucumber World Context

### Understanding Cucumber's "World" Concept

In Cucumber, the **World** is a context object that provides shared state and functionality across all step definitions within a single scenario. Think of it as the "this" context that gets passed between your Given, When, and Then steps.

**Key Concepts:**
- **Scenario Isolation**: Each scenario gets a fresh World instance
- **State Sharing**: Steps can store and access data through the World
- **Lifecycle Management**: World exists from scenario start to finish
- **Dependency Injection**: World provides access to utilities and clients

### Our Custom World Implementation

The `CustomWorld` class extends Cucumber's default World to provide:

#### 1. **API Client Access**
```typescript
// Two API clients for different needs
this.apiGateway    // Modern, type-safe API client (generated from OpenAPI)
this.apiClient     // Legacy compatibility layer for existing tests
```

#### 2. **State Management**
```typescript
// Track test state across steps
this.response      // Last HTTP response from API calls
this.currentUser   // Active user being tested
this.userData      // User data for current operation
this.createdUsers  // Auto-tracked users for cleanup
```

#### 3. **Test Lifecycle Hooks**
```typescript
// Automatic setup and teardown
await this.setupTestScenario('scenario-name');    // Pre-scenario setup
await this.teardownTestScenario();                // Post-scenario cleanup
this.addCreatedUser(user);                        // Track for auto-cleanup
```

### How World Works in Practice

Consider this typical test flow:

```gherkin
Scenario: Create and update user
  Given I have user data:
    | name     | email           |
    | John Doe | john@example.com|
  When I create the user
  Then the user should be created successfully
  When I update the user's bio to "Software Engineer"
  Then the user's bio should be updated
```

**Step-by-Step World Usage:**

```typescript
// Step 1: Store user data in World
Given('I have user data:', function(this: CustomWorld, dataTable) {
  this.userData = dataTable.hashes()[0]; // Stored in World for later steps
});

// Step 2: Create user, store response and track for cleanup
When('I create the user', async function(this: CustomWorld) {
  this.response = await this.apiClient.createUser(this.userData); // Uses stored data
  this.currentUser = this.response.data;                          // Store created user
  this.addCreatedUser(this.currentUser);                          // Track for cleanup
});

// Step 3: Validate response from World
Then('the user should be created successfully', function(this: CustomWorld) {
  assert(this.response?.status === 201);      // Access stored response
  assert(this.currentUser?.id);               // Access stored user
});

// Step 4: Update using current user from World
When('I update the user\'s bio to {string}', async function(this: CustomWorld, bio: string) {
  this.response = await this.apiClient.updateUser(this.currentUser.id, { bio });
  this.currentUser = this.response.data;      // Update stored user
});

// Step 5: Validate updated state
Then('the user\'s bio should be updated', function(this: CustomWorld) {
  assert(this.currentUser?.bio === 'Software Engineer');
});
```

### World Lifecycle and Cleanup

**Scenario Start:**
1. Fresh `CustomWorld` instance created
2. API clients initialized
3. Empty state containers ready

**During Scenario:**
1. Steps store and share data through World properties
2. API responses cached for validation
3. Created resources automatically tracked

**Scenario End:**
1. `teardownTestScenario()` automatically called
2. All tracked users deleted from database
3. World instance destroyed (ready for next scenario)

### Advanced World Features

#### 1. **Test Helper Integration**
```typescript
// Access test utilities through World
await this.testHelpers.waitForHealthy(30000);
await this.testHelpers.cleanupTestUsers(this.createdUsers.map(u => u.id));
```

#### 2. **Error Context Preservation**
```typescript
// World maintains error context across steps
try {
  this.response = await this.apiClient.deleteUser(999);
} catch (error) {
  this.lastError = error; // Available for validation in next step
}
```

#### 3. **Scenario-Specific Setup**
```typescript
// Different scenarios can have different initialization
await this.setupTestScenario('admin-user-scenario');  // Sets up admin context
await this.setupTestScenario('bulk-operation');       // Sets up multiple users
```

### Best Practices for World Usage

#### ✅ **Good Practices**
```typescript
// Store meaningful state
this.currentUser = response.data;

// Use descriptive property names
this.lastValidationError = error;

// Track resources for cleanup
this.addCreatedUser(user);

// Chain operations through World state
const updatedUser = await this.apiClient.updateUser(this.currentUser.id, changes);
```

#### ❌ **Avoid These Patterns**
```typescript
// Don't store temporary variables
this.temp = someValue; // Use local variables instead

// Don't bypass World for shared state
globalState.user = user; // Use this.currentUser instead

// Don't forget cleanup tracking
const user = await createUser(); // Should use this.addCreatedUser()
```

### World Implementation Details

Our `CustomWorld` extends the base Cucumber World with:

```typescript
export class CustomWorld extends World {
  // API Access
  public apiGateway: DefaultApi;
  public apiClient: any; // Legacy compatibility

  // State Management
  public response?: any;
  public currentUser?: UserResponse;
  public userData?: any;
  public createdUsers: UserResponse[] = [];

  // Lifecycle Methods
  async setupTestScenario(scenarioType?: string): Promise<void>
  async teardownTestScenario(): Promise<void>
  addCreatedUser(user: UserResponse): void
  
  // Test Utilities
  public testHelpers: TestHelperBuilder;
}
```

This design ensures that:
- Each scenario runs in complete isolation
- Test data is automatically managed and cleaned up
- API clients are readily available to all steps
- Complex test state can be maintained across multiple steps
- Debugging is simplified through consistent state access patterns

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