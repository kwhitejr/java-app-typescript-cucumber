import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { UserCreateRequest, HealthResponse, InfoResponse, MetricsResponse } from '../support/enhanced-types';

function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

Given('the Application is running', async function(this: CustomWorld) {
  const isHealthy = await this.apiClient.healthCheck();
  assert(isHealthy, 'Application is not running or not accessible');
});

Given('some users exist in the system', async function(this: CustomWorld) {
  const testUsers: UserCreateRequest[] = [
    { name: 'Test User 1', email: 'test1@example.com', bio: 'Test bio 1' },
    { name: 'Test User 2', email: 'test2@example.com', bio: 'Test bio 2' }
  ];
  
  for (const userData of testUsers) {
    await this.apiClient.createUser(userData);
  }
});

When('I request the health endpoint', async function(this: CustomWorld) {
  this.response = await this.apiClient.getActuatorHealth();
});

When('I request the info endpoint', async function(this: CustomWorld) {
  this.response = await this.apiClient.getActuatorInfo();
});

When('I request the metrics endpoint', async function(this: CustomWorld) {
  this.response = await this.apiClient.getActuatorMetrics();
});

When('I request the {string} actuator endpoint', async function(this: CustomWorld, endpoint: string) {
  this.response = await this.apiClient.getActuatorEndpoint(endpoint);
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

Then('the response should contain application metadata', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const infoData = this.response.data as InfoResponse;
  assert(infoData.application, 'Info response should contain application metadata');
  
  const app = infoData.application;
  assert(app?.name, 'Application name should be present');
  assert(app?.version, 'Application version should be present');
  assert(app?.description, 'Application description should be present');
});

Then('the response should contain build information', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const infoData = this.response.data as InfoResponse;
  assert(infoData.build, 'Info response should contain build information');
  
  const build = infoData.build;
  assert(build?.artifact, 'Build artifact should be present');
  assert(build?.group, 'Build group should be present');
});

Then('the response should contain available metric names', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const metricsData = this.response.data as MetricsResponse;
  assert(metricsData.names, 'Metrics response should contain names array');
  assert(Array.isArray(metricsData.names), 'Metric names should be an array');
  assert(metricsData.names.length > 0, 'Should have at least some metrics available');
});

Then('the metrics should include JVM metrics', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const metricsData = this.response.data as MetricsResponse;
  const metricNames = metricsData.names;
  
  const hasJvmMemoryMetrics = metricNames?.some((name: string) => name.includes('jvm.memory')) ?? false;
  const hasJvmGcMetrics = metricNames?.some((name: string) => name.includes('jvm.gc')) ?? false;
  const hasJvmThreadMetrics = metricNames?.some((name: string) => name.includes('jvm.threads')) ?? false;
  
  assert(hasJvmMemoryMetrics, 'Should contain JVM memory metrics');
  assert(hasJvmGcMetrics, 'Should contain JVM garbage collection metrics');
  assert(hasJvmThreadMetrics, 'Should contain JVM thread metrics');
});

Then('the metrics should include HTTP metrics', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const metricsData = this.response.data as MetricsResponse;
  const metricNames = metricsData.names;
  
  const hasHttpMetrics = metricNames?.some((name: string) => name.includes('http.server'));
  assert(hasHttpMetrics, 'Should contain HTTP server metrics');
});

Then('the response should contain valid JSON data', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const data = this.response.data;
  assert(data, 'Response should contain data');
  assert(typeof data === 'object', 'Response data should be a valid JSON object');
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

Then('the metrics should contain HTTP request metrics', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const metricsData = this.response.data as MetricsResponse;
  const metricNames = metricsData.names;
  
  const hasHttpRequestMetrics = metricNames?.some((name: string) => 
    name.includes('http.server.requests') || name.includes('http_server_requests'));
  assert(hasHttpRequestMetrics, 'Should contain HTTP request metrics');
});

Then('the metrics should include database connection pool metrics', function(this: CustomWorld) {
  assert(this.response, 'No response available');
  const metricsData = this.response.data as MetricsResponse;
  const metricNames = metricsData.names;
  
  const hasConnectionPoolMetrics = metricNames?.some((name: string) => 
    name.includes('hikaricp') || name.includes('connection.pool') || name.includes('datasource'));
  assert(hasConnectionPoolMetrics, 'Should contain database connection pool metrics');
});