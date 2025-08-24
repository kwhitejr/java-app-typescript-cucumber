import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import { ApiGateway } from './api-gateway';

let globalApiGateway: ApiGateway;

BeforeAll({ timeout: 120000 }, async function() {
  console.log('🚀 Starting test suite...');
  
  const baseURL = process.env.API_BASE_URL || 'http://localhost:8080';
  globalApiGateway = ApiGateway.forTesting(baseURL);
  
  console.log('⏳ Waiting for API to be ready...');
  
  const isReady = await globalApiGateway.waitForHealthy(120000); // 2 minutes timeout
  if (!isReady) {
    throw new Error('❌ API is not ready after waiting 2 minutes. Please ensure the Spring Boot application is running.');
  }
  
  console.log('✅ API is ready!');
  
  // Optional: Run diagnostics
  const diagnostics = await globalApiGateway.diagnose();
  console.log('🔍 System diagnostics:', {
    healthy: diagnostics.healthy,
    userCount: diagnostics.userCount,
    appInfo: diagnostics.info?.application?.name
  });
});

Before(async function(this: CustomWorld, testCase) {
  console.log(`📝 Starting scenario: ${testCase.pickle.name}`);
  
  // Setup test scenario with enhanced tracking
  await this.setupTestScenario(testCase.pickle.name);
  this.reset();
});

After(async function(this: CustomWorld, testCase) {
  const scenarioName = testCase.pickle.name;
  const failed = testCase.result?.status === 'FAILED';
  
  if (failed) {
    console.log(`❌ Scenario failed: ${scenarioName}`);
    
    // Enhanced error logging
    if (this.response) {
      console.log('📄 Last response:', JSON.stringify(this.response, null, 2));
    }
    if (this.lastError) {
      console.log('🚨 Last error:', JSON.stringify(this.lastError, null, 2));
    }
    
    // Capture system state for debugging
    try {
      const diagnostics = await this.apiGateway.diagnose();
      console.log('🔍 System state at failure:', diagnostics);
    } catch (error) {
      console.log('⚠️ Could not capture system diagnostics:', error);
    }
  } else {
    console.log(`✅ Scenario passed: ${scenarioName}`);
  }
  
  // Enhanced cleanup with better error handling
  try {
    await this.teardownTestScenario();
  } catch (error) {
    console.warn(`⚠️ Cleanup failed for scenario "${scenarioName}":`, error);
    // Don't fail the test due to cleanup issues, just log them
  }
});

AfterAll(async function() {
  console.log('🧹 Running final cleanup...');
  
  try {
    // Final cleanup of any remaining test data
    if (globalApiGateway) {
      await globalApiGateway.testHelpers.cleanupAllTestUsers();
      console.log('✅ Final test data cleanup completed');
    }
  } catch (error) {
    console.warn('⚠️ Final cleanup had issues:', error);
  }
  
  console.log('🏁 Test suite completed');
});