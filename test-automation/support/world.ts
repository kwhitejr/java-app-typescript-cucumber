import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { ApiGateway } from './api-gateway';
import { 
  TestContext, 
  EnhancedUserResponse, 
  ErrorResponse,
  BuilderResponse,
  UserCreateRequest,
  UserResponse
} from './enhanced-types';

export class CustomWorld extends World implements TestContext {
  public apiGateway: ApiGateway;
  public response?: BuilderResponse<unknown>;
  public currentUser?: EnhancedUserResponse;
  public createdUsers: EnhancedUserResponse[] = [];
  public lastError?: ErrorResponse;
  public userData?: UserCreateRequest;
  public testMetadata?: {
    testName?: string;
    startTime?: Date;
    tags?: string[];
  };

  // Legacy support - delegate to new ApiGateway with proper types
  public get apiClient() {
    // Create a compatibility layer for existing tests
    return {
      getAllUsers: () => this.apiGateway.getAllUsersCompat(),
      getUserById: (id: number) => this.apiGateway.getUserByIdCompat(id),
      createUser: (userData: UserCreateRequest) => this.apiGateway.createUserCompat(userData),
      updateUser: (id: number, userData: UserCreateRequest) => this.apiGateway.updateUserCompat(id, userData),
      deleteUser: (id: number) => this.apiGateway.deleteUserCompat(id),
      getActuatorHealth: () => this.apiGateway.getHealthCompat(),
      getActuatorInfo: () => this.apiGateway.getInfoCompat(),
      getActuatorMetrics: () => this.apiGateway.getMetricsCompat(),
      getActuatorEndpoint: (endpoint: string) => this.apiGateway.getActuatorEndpointCompat(endpoint),
      healthCheck: () => this.apiGateway.isHealthy(),
      waitForApi: (maxRetries?: number, intervalMs?: number) => this.apiGateway.waitForHealthy((maxRetries || 30) * (intervalMs || 1000))
    };
  }

  constructor(options: IWorldOptions) {
    super(options);
    
    // Initialize the new ApiGateway
    const baseURL = process.env.API_BASE_URL || 'http://localhost:8080';
    this.apiGateway = ApiGateway.forTesting(baseURL);
    
    this.createdUsers = [];
    this.testMetadata = {
      startTime: new Date(),
      testName: (options as any).pickle?.name
    };
  }

  public reset(): void {
    this.response = undefined;
    this.currentUser = undefined;
    this.lastError = undefined;
    this.userData = undefined;
  }

  public addCreatedUser(user: EnhancedUserResponse): void {
    // Add test metadata to track users created in this test
    user._testMetadata = {
      createdInTest: this.testMetadata?.testName,
      shouldCleanup: true
    };
    this.createdUsers.push(user);
  }

  public getLastCreatedUser(): EnhancedUserResponse | undefined {
    return this.createdUsers[this.createdUsers.length - 1];
  }

  public async cleanupCreatedUsers(): Promise<void> {
    if (this.createdUsers.length === 0) return;

    const userIds = this.createdUsers
      .filter(user => user.id && user._testMetadata?.shouldCleanup)
      .map(user => user.id!);

    if (userIds.length > 0) {
      try {
        await this.apiGateway.testHelpers.cleanupTestUsers(userIds);
        console.log(`✅ Cleaned up ${userIds.length} test users`);
      } catch (error) {
        console.warn('⚠️ Failed to cleanup test users:', error);
      }
    }

    this.createdUsers = [];
  }

  public async setupTestScenario(scenarioName: string): Promise<void> {
    this.testMetadata = {
      ...this.testMetadata,
      testName: scenarioName,
      startTime: new Date()
    };

    await this.apiGateway.setupTest(scenarioName);
  }

  public async teardownTestScenario(): Promise<void> {
    await this.cleanupCreatedUsers();
    await this.apiGateway.teardownTest(this.testMetadata?.testName);
  }
}

setWorldConstructor(CustomWorld);