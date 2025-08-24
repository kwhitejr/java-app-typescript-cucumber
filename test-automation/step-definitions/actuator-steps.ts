import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HealthResponse } from '../support/enhanced-types';
import { expect } from 'chai';

Given('the Application is running', async function(this: CustomWorld) {
  const isHealthy = await this.apiGateway.isHealthy();
  expect(isHealthy).to.be.true;
});

When('I request the health endpoint', async function(this: CustomWorld) {
  this.response = await this.apiGateway.getHealthCompat();
});

Then('the health status should be {string}', function(this: CustomWorld, expectedStatus: string) {
  expect(this.response).to.exist;
  const healthData = this.response!.data as HealthResponse;
  expect(healthData).to.have.property('status').that.equals(expectedStatus);
});

Then('the health response should contain components', function(this: CustomWorld) {
  expect(this.response).to.exist;
  const healthData = this.response!.data as HealthResponse;
  expect(healthData).to.have.property('components').that.is.an('object');
});


Then('the health components should include {string}', function(this: CustomWorld, componentName: string) {
  expect(this.response).to.exist;
  const healthData = this.response!.data as HealthResponse;
  expect(healthData).to.have.property('components');
  expect(healthData.components).to.have.property(componentName);
});

Then('the database component status should be {string}', function(this: CustomWorld, expectedStatus: string) {
  expect(this.response).to.exist;
  const healthData = this.response!.data as HealthResponse;
  expect(healthData).to.have.deep.nested.property('components.db.status').that.equals(expectedStatus);
});

