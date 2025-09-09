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
  public profileData?: {
    name: string;
    email: string;
    bio?: string;
  };
  public testMetadata?: {
    testName?: string;
    startTime?: Date;
    tags?: string[];
  };


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
    this.profileData = undefined;
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