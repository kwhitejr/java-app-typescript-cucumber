import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { UserResponse, UserCreateRequest, ErrorResponse } from '../support/enhanced-types';

function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

Given('the User API is running', async function(this: CustomWorld) {
  const isHealthy = await this.apiClient.healthCheck();
  assert(isHealthy, 'User API is not running or not accessible');
});

Given('the database is clean', async function(this: CustomWorld) {
  const response = await this.apiClient.getAllUsers();
  assert(response.status === 200, `Failed to check database state: ${response.status}`);
  
  const users = response.data as UserResponse[];
  for (const user of users) {
    if (user.id) {
      await this.apiClient.deleteUser(user.id);
    }
  }
});

Given('I have valid user data:', function(this: CustomWorld, dataTable) {
  const userData = dataTable.hashes()[0];
  this.userData = {
    name: userData.name,
    email: userData.email,
    bio: userData.bio || undefined
  };
});

Given('I have invalid user data:', function(this: CustomWorld, dataTable) {
  const userData = dataTable.hashes()[0];
  this.userData = {
    name: userData.name || '',
    email: userData.email || '',
    bio: userData.bio || undefined
  };
});

Given('a user exists with name {string} and email {string}', async function(this: CustomWorld, name: string, email: string) {
  const userData: UserCreateRequest = {
    name: name,
    email: email,
    bio: 'Test user bio'
  };
  
  const response = await this.apiClient.createUser(userData);
  assert(response.status === 201, `Failed to create test user: ${response.status}`);
  
  this.currentUser = response.data as UserResponse;
  this.addCreatedUser(this.currentUser);
});

When('I request all users', async function(this: CustomWorld) {
  this.response = await this.apiClient.getAllUsers();
});

When('I create a new user', async function(this: CustomWorld) {
  assert(this.userData, 'No user data provided');
  this.response = await this.apiClient.createUser(this.userData);
  
  if (this.response.status === 201) {
    this.addCreatedUser(this.response.data as UserResponse);
  }
});

When('I request the user by ID', async function(this: CustomWorld) {
  assert(this.currentUser?.id, 'No current user ID available');
  this.response = await this.apiClient.getUserById(this.currentUser.id);
});

When('I request a user with ID {int}', async function(this: CustomWorld, userId: number) {
  this.response = await this.apiClient.getUserById(userId);
});

When('I update the user with:', async function(this: CustomWorld, dataTable) {
  assert(this.currentUser?.id, 'No current user ID available');
  
  const updateData = dataTable.hashes()[0];
  const userData: UserCreateRequest = {
    name: updateData.name,
    email: updateData.email,
    bio: updateData.bio || undefined
  };
  
  this.response = await this.apiClient.updateUser(this.currentUser.id, userData);
});

When('I try to update a user with ID {int}', async function(this: CustomWorld, userId: number) {
  const userData: UserCreateRequest = {
    name: 'Updated Name',
    email: 'updated@example.com',
    bio: 'Updated bio'
  };
  
  this.response = await this.apiClient.updateUser(userId, userData);
});

When('I delete the user', async function(this: CustomWorld) {
  assert(this.currentUser?.id, 'No current user ID available');
  this.response = await this.apiClient.deleteUser(this.currentUser.id);
});

When('I try to delete a user with ID {int}', async function(this: CustomWorld, userId: number) {
  this.response = await this.apiClient.deleteUser(userId);
});

When('I try to create another user with email {string}', async function(this: CustomWorld, email: string) {
  const userData: UserCreateRequest = {
    name: 'Another User',
    email: email,
    bio: 'Another user bio'
  };
  
  this.response = await this.apiClient.createUser(userData);
});

Then('the response status should be {int}', function(this: CustomWorld, expectedStatus: number) {
  assert(this.response, 'No response available');
  assert(this.response.status === expectedStatus, 
    `Expected status ${expectedStatus}, but got ${this.response.status}. Response: ${JSON.stringify(this.response.data)}`);
});

Then('the response should contain an empty list', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  assert(Array.isArray(this.response.data), 'Response data is not an array');
  assert(this.response.data.length === 0, `Expected empty array, but got ${this.response.data.length} items`);
});

Then('the response should contain the user data', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  assert(this.userData, 'No user data to compare against');
  
  const responseUser = this.response.data as UserResponse;
  assert(responseUser.name === this.userData.name, `Expected name ${this.userData.name}, got ${responseUser.name}`);
  assert(responseUser.email === this.userData.email, `Expected email ${this.userData.email}, got ${responseUser.email}`);
  
  if (this.userData.bio) {
    assert(responseUser.bio === this.userData.bio, `Expected bio ${this.userData.bio}, got ${responseUser.bio}`);
  }
});

Then('the user should have a generated ID', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  
  const responseUser = this.response.data as UserResponse;
  assert(responseUser.id, 'User should have an ID');
  assert(typeof responseUser.id === 'number', 'User ID should be a number');
  assert(responseUser.id > 0, 'User ID should be positive');
});

Then('the response should contain {int} user(s)', function(this: CustomWorld, expectedCount: number) {
  assert(this.response, 'No response available');
  assert(Array.isArray(this.response.data), 'Response data is not an array');
  assert(this.response.data.length === expectedCount, 
    `Expected ${expectedCount} users, but got ${this.response.data.length}`);
});

Then('the response should contain the user {string}', function(this: CustomWorld, expectedName: string) {
  assert(this.response, 'No response available');
  
  const responseUser = this.response.data as UserResponse;
  assert(responseUser.name === expectedName, `Expected user name ${expectedName}, got ${responseUser.name}`);
});

Then('the response should contain the updated user data', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  
  const responseUser = this.response.data as UserResponse;
  assert(responseUser.id === this.currentUser?.id, 'User ID should remain the same');
  assert(responseUser.name === 'Updated Name', 'User name should be updated');
  assert(responseUser.email === 'updated@example.com', 'User email should be updated');
  assert(responseUser.bio === 'Updated bio', 'User bio should be updated');
});

Then('the response should contain validation errors', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  
  const errorResponse = this.response.data as ErrorResponse;
  assert(errorResponse.error === 'Validation Failed', 'Expected validation error');
  assert(errorResponse.validationErrors && errorResponse.validationErrors.length > 0, 
    'Expected validation errors to be present');
});

Then('the response should contain a conflict error message', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  
  const errorResponse = this.response.data as ErrorResponse;
  assert(errorResponse.error === 'Conflict', 'Expected conflict error');
  assert(errorResponse.message && errorResponse.message.includes('already exists'), 'Expected duplicate email error message');
});

Then('the response should contain a not found error message', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  
  const errorResponse = this.response.data as ErrorResponse;
  assert(errorResponse.error === 'Not Found', 'Expected not found error');
  assert(errorResponse.message && errorResponse.message.includes('not found'), 'Expected not found error message');
});