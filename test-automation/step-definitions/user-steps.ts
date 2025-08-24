import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { UserResponse, UserCreateRequest, ErrorResponse } from '../support/enhanced-types';
import { expect } from 'chai';

Given('the User API is running', async function(this: CustomWorld) {
  const isHealthy = await this.apiGateway.isHealthy();
  expect(isHealthy).to.be.true;
});

Given('the database is clean', async function(this: CustomWorld) {
  const response = await this.apiGateway.getAllUsersCompat();
  expect(response.status).to.equal(200);
  
  const users = response.data as UserResponse[];
  for (const user of users) {
    if (user.id) {
      await this.apiGateway.deleteUserCompat(user.id);
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
  
  const response = await this.apiGateway.createUserCompat(userData);
  expect(response.status).to.equal(201);
  
  this.currentUser = response.data as UserResponse;
  this.addCreatedUser(this.currentUser);
});

When('I request all users', async function(this: CustomWorld) {
  this.response = await this.apiGateway.getAllUsersCompat();
});

When('I create a new user', async function(this: CustomWorld) {
  expect(this.userData).to.exist;
  this.response = await this.apiGateway.createUserCompat(this.userData!);
  
  if (this.response.status === 201) {
    this.addCreatedUser(this.response.data as UserResponse);
  }
});

When('I request the user by ID', async function(this: CustomWorld) {
  expect(this.currentUser?.id).to.exist;
  this.response = await this.apiGateway.getUserByIdCompat(this.currentUser!.id!);
});

When('I request a user with ID {int}', async function(this: CustomWorld, userId: number) {
  this.response = await this.apiGateway.getUserByIdCompat(userId);
});

When('I update the user with:', async function(this: CustomWorld, dataTable) {
  expect(this.currentUser?.id).to.exist;
  
  const updateData = dataTable.hashes()[0];
  const userData: UserCreateRequest = {
    name: updateData.name,
    email: updateData.email,
    bio: updateData.bio || undefined
  };
  
  this.response = await this.apiGateway.updateUserCompat(this.currentUser!.id!, userData);
});

When('I try to update a user with ID {int}', async function(this: CustomWorld, userId: number) {
  const userData: UserCreateRequest = {
    name: 'Updated Name',
    email: 'updated@example.com',
    bio: 'Updated bio'
  };
  
  this.response = await this.apiGateway.updateUserCompat(userId, userData);
});

When('I delete the user', async function(this: CustomWorld) {
  expect(this.currentUser?.id).to.exist;
  this.response = await this.apiGateway.deleteUserCompat(this.currentUser!.id!);
});

When('I try to delete a user with ID {int}', async function(this: CustomWorld, userId: number) {
  this.response = await this.apiGateway.deleteUserCompat(userId);
});

When('I try to create another user with email {string}', async function(this: CustomWorld, email: string) {
  const userData: UserCreateRequest = {
    name: 'Another User',
    email: email,
    bio: 'Another user bio'
  };
  
  this.response = await this.apiGateway.createUserCompat(userData);
});

Then('the response status should be {int}', function(this: CustomWorld, expectedStatus: number) {
  expect(this.response).to.exist;
  expect(this.response!.status).to.equal(expectedStatus);
});

Then('the response should contain an empty list', function(this: CustomWorld) {
  expect(this.response).to.exist;
  expect(this.response!.data).to.be.an('array').that.is.empty;
});

Then('the response should contain the user data', function(this: CustomWorld) {
  expect(this.response).to.exist;
  expect(this.userData).to.exist;
  
  const responseUser = this.response!.data as UserResponse;
  expect(responseUser).to.have.property('name').that.equals(this.userData!.name);
  expect(responseUser).to.have.property('email').that.equals(this.userData!.email);
  
  if (this.userData!.bio) {
    expect(responseUser).to.have.property('bio').that.equals(this.userData!.bio);
  }
});

Then('the user should have a generated ID', function(this: CustomWorld) {
  expect(this.response).to.exist;
  
  const responseUser = this.response!.data as UserResponse;
  expect(responseUser).to.have.property('id').that.is.a('number').and.is.greaterThan(0);
});

Then('the response should contain {int} user(s)', function(this: CustomWorld, expectedCount: number) {
  expect(this.response).to.exist;
  expect(this.response!.data).to.be.an('array').with.lengthOf(expectedCount);
});

Then('the response should contain the user {string}', function(this: CustomWorld, expectedName: string) {
  expect(this.response).to.exist;
  
  const responseUser = this.response!.data as UserResponse;
  expect(responseUser).to.have.property('name').that.equals(expectedName);
});

Then('the response should contain the updated user data', function(this: CustomWorld) {
  expect(this.response).to.exist;
  
  const responseUser = this.response!.data as UserResponse;
  expect(responseUser).to.have.property('id').that.equals(this.currentUser?.id);
  expect(responseUser).to.have.property('name').that.equals('Updated Name');
  expect(responseUser).to.have.property('email').that.equals('updated@example.com');
  expect(responseUser).to.have.property('bio').that.equals('Updated bio');
});

Then('the response should contain validation errors', function(this: CustomWorld) {
  expect(this.response).to.exist;
  
  const errorResponse = this.response!.data as ErrorResponse;
  expect(errorResponse).to.have.property('error').that.equals('Validation Failed');
  expect(errorResponse).to.have.property('validationErrors').that.is.an('array').and.is.not.empty;
});

Then('the response should contain a conflict error message', function(this: CustomWorld) {
  expect(this.response).to.exist;
  
  const errorResponse = this.response!.data as ErrorResponse;
  expect(errorResponse).to.have.property('error').that.equals('Conflict');
  expect(errorResponse).to.have.property('message').that.includes('already exists');
});

Then('the response should contain a not found error message', function(this: CustomWorld) {
  expect(this.response).to.exist;
  
  const errorResponse = this.response!.data as ErrorResponse;
  expect(errorResponse).to.have.property('error').that.equals('Not Found');
  expect(errorResponse).to.have.property('message').that.includes('not found');
});