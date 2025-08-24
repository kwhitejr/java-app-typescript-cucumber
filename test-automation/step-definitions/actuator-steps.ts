import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HealthResponse } from '../support/enhanced-types';

function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

Given('the Application is running', async function(this: CustomWorld) {
  const isHealthy = await this.apiClient.healthCheck();
  assert(isHealthy, 'Application is not running or not accessible');
});

When('I request the health endpoint', async function(this: CustomWorld) {
  this.response = await this.apiClient.getActuatorHealth();
});

Then('the health status should be {string}', function(this: CustomWorld, expectedStatus: string) {
  assert(this.response, 'No response available');
  const healthData = this.response.data as HealthResponse;
  assert(healthData.status === expectedStatus, 
    `Expected health status ${expectedStatus}, but got ${healthData.status}`);
});

Then('the health response should contain components', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const healthData = this.response.data as HealthResponse;
  assert(healthData.components, 'Health response should contain components');
  assert(typeof healthData.components === 'object', 'Components should be an object');
});


Then('the health components should include {string}', function(this: CustomWorld, componentName: string) {
  assert(this.response, 'No response available');
  const healthData = this.response.data as HealthResponse;
  assert(healthData.components, 'Health response should contain components');
  assert(healthData.components?.[componentName], 
    `Health components should include ${componentName}`);
});

Then('the database component status should be {string}', function(this: CustomWorld, expectedStatus: string) {
  assert(this.response, 'No response available');
  const healthData = this.response.data as HealthResponse;
  assert(healthData.components?.db, 'Health response should contain db component');
  assert(healthData.components.db.status === expectedStatus,
    `Expected database status ${expectedStatus}, but got ${healthData.components.db.status}`);
});

