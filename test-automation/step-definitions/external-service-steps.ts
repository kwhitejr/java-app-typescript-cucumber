import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { UserCreateRequest, ErrorResponse } from '../support/enhanced-types';
import { expect } from 'chai';
import axios from 'axios';

// Profile validation service setup
Given('the profile validation service is available', async function(this: CustomWorld) {
  const wiremockBaseUrl = process.env.WIREMOCK_BASE_URL || 'http://localhost:8081';
  try {
    const response = await axios.get(`${wiremockBaseUrl}/__admin/health`);
    expect(response.status).to.equal(200);
  } catch (error) {
    throw new Error('Profile validation service (WireMock) is not available');
  }
});

// User data setup for specific validation scenarios
Given('I have user data that will be rejected:', function(this: CustomWorld, dataTable) {
  const userData = dataTable.hashes()[0];
  this.userData = {
    name: userData.name,
    email: userData.email,
    bio: userData.bio || undefined
  };
});

Given('I have user data that will trigger service error:', function(this: CustomWorld, dataTable) {
  const userData = dataTable.hashes()[0];
  this.userData = {
    name: userData.name,
    email: userData.email,
    bio: userData.bio || undefined
  };
});


Given('I have valid profile data:', function(this: CustomWorld, dataTable) {
  const userData = dataTable.hashes()[0];
  this.profileData = {
    name: userData.name,
    email: userData.email,
    bio: userData.bio || undefined
  };
});

Given('I have profile data that will be rejected:', function(this: CustomWorld, dataTable) {
  const userData = dataTable.hashes()[0];
  this.profileData = {
    name: userData.name,
    email: userData.email,
    bio: userData.bio || undefined
  };
});

// Update actions for validation scenarios
When('I update the user with rejected data:', async function(this: CustomWorld, dataTable) {
  const updateData = dataTable.hashes()[0];
  const userData: UserCreateRequest = {
    name: updateData.name,
    email: updateData.email,
    bio: updateData.bio || undefined
  };
  
  if (!this.currentUser || !this.currentUser.id) {
    throw new Error('No current user to update');
  }
  
  this.response = await this.apiGateway.updateUserCompat(this.currentUser.id, userData);
});

// Profile validation endpoint calls
When('I call the profile validation endpoint', async function(this: CustomWorld) {
  if (!this.profileData) {
    throw new Error('No profile data set');
  }
  
  this.response = await this.apiGateway.callProfileValidation(this.profileData);
});

// Validation assertions
Then('the response should contain a profile validation error', function(this: CustomWorld) {
  expect(this.response).to.exist;
  expect(this.response!.status).to.equal(400);
  
  const errorResponse = this.response!.data as ErrorResponse;
  expect(errorResponse.message).to.match(/profile validation/i);
});

Then('the response should contain a service unavailable error', function(this: CustomWorld) {
  expect(this.response).to.exist;
  expect(this.response!.status).to.equal(400);
  
  const errorResponse = this.response!.data as ErrorResponse;
  expect(errorResponse.message).to.match(/service.*unavailable|validation.*failed/i);
});


Then('the profile validation service should have been called', async function(this: CustomWorld) {
  const wiremockBaseUrl = process.env.WIREMOCK_BASE_URL || 'http://localhost:8081';
  
  try {
    const response = await axios.get(`${wiremockBaseUrl}/__admin/requests`);
    expect(response.status).to.equal(200);
    
    const requests = response.data.requests;
    const validationRequests = requests.filter((req: any) => 
      req.request.url.includes('/api/profile/validate') && req.request.method === 'POST'
    );
    
    expect(validationRequests.length).to.be.greaterThan(0, 
      'Expected at least one call to profile validation service');
  } catch (error) {
    throw new Error('Failed to verify profile validation service calls');
  }
});

// Profile validation response assertions
Then('the validation response should indicate success', function(this: CustomWorld) {
  expect(this.response).to.exist;
  expect(this.response!.status).to.equal(200);
  
  const validationResponse = this.response!.data as any;
  expect(validationResponse).to.have.property('valid', true);
  expect(validationResponse).to.have.property('message');
});

Then('the validation response should indicate failure', function(this: CustomWorld) {
  expect(this.response).to.exist;
  expect(this.response!.status).to.equal(200);
  
  const validationResponse = this.response!.data as any;
  expect(validationResponse).to.have.property('valid', false);
  expect(validationResponse).to.have.property('message');
});

Then('the response should contain a risk score', function(this: CustomWorld) {
  expect(this.response).to.exist;
  expect(this.response!.status).to.equal(200);
  
  const validationResponse = this.response!.data as any;
  expect(validationResponse).to.have.property('riskScore');
  expect(['LOW', 'MEDIUM', 'HIGH']).to.include(validationResponse.riskScore);
});

Then('the response should contain a high risk score', function(this: CustomWorld) {
  expect(this.response).to.exist;
  expect(this.response!.status).to.equal(200);
  
  const validationResponse = this.response!.data as any;
  expect(validationResponse).to.have.property('riskScore', 'HIGH');
});

// Cleanup between scenarios - reset WireMock request log
Given('I reset the validation service request log', async function(this: CustomWorld) {
  const wiremockBaseUrl = process.env.WIREMOCK_BASE_URL || 'http://localhost:8081';
  
  try {
    await axios.delete(`${wiremockBaseUrl}/__admin/requests`);
  } catch (error) {
    // Ignore errors during cleanup - service might not be available during local development
    console.warn('Could not reset WireMock request log:', error);
  }
});