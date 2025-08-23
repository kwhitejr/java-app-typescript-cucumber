import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import { ApiClient } from './api-client';

BeforeAll(async function() {
  console.log('🚀 Starting test suite...');
  
  const apiClient = ApiClient.getInstance();
  console.log('⏳ Waiting for API to be ready...');
  
  const isReady = await apiClient.waitForApi(60, 2000);
  if (!isReady) {
    throw new Error('❌ API is not ready after waiting 2 minutes. Please ensure the Spring Boot application is running.');
  }
  
  console.log('✅ API is ready!');
});

Before(async function(this: CustomWorld, testCase) {
  console.log(`📝 Starting scenario: ${testCase.pickle.name}`);
  this.reset();
});

After(async function(this: CustomWorld, testCase) {
  if (testCase.result?.status === 'FAILED') {
    console.log(`❌ Scenario failed: ${testCase.pickle.name}`);
    if (this.response) {
      console.log('Last response:', JSON.stringify(this.response, null, 2));
    }
    if (this.lastError) {
      console.log('Last error:', JSON.stringify(this.lastError, null, 2));
    }
  } else {
    console.log(`✅ Scenario passed: ${testCase.pickle.name}`);
  }
  
  this.createdUsers = [];
});

AfterAll(async function() {
  console.log('🏁 Test suite completed');
});