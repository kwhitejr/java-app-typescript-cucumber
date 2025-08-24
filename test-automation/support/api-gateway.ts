import { AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { Configuration, UsersApi, UserResponse, UserCreateRequest } from '../generated';
import { HealthResponse } from './enhanced-types';
import { TestHelperBuilder } from './builders/test-helper-builder';
import { BuilderConfig } from './builders/base-builder';
import { BuilderResponse } from './enhanced-types';

export interface ApiGatewayConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  enableLogging?: boolean;
}

export class ApiGateway {
  // Generated API clients
  public readonly users: UsersApi;

  // Builder-based clients for test utilities
  public readonly testHelpers: TestHelperBuilder;

  private readonly config: ApiGatewayConfig;

  constructor(config: ApiGatewayConfig) {
    this.config = {
      timeout: 10000,
      retries: 0,
      retryDelay: 1000,
      enableLogging: false,
      ...config
    };

    // Configure generated clients
    const openApiConfig = new Configuration({
      basePath: config.baseURL,
    });

    this.users = new UsersApi(openApiConfig);

    // Configure builder clients
    const builderConfig: BuilderConfig = {
      baseURL: config.baseURL,
      timeout: this.config.timeout,
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
      headers: this.config.headers
    };

    this.testHelpers = new TestHelperBuilder(builderConfig);

    if (this.config.enableLogging) {
      this.enableLogging();
    }
  }

  // Convenience methods for common operations
  async isHealthy(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.baseURL}/actuator/health`, { timeout: 5000 });
      return response.status === 200 && response.data.status === 'UP';
    } catch {
      return false;
    }
  }

  async waitForHealthy(timeout?: number): Promise<boolean> {
    return this.testHelpers.waitForHealthy(timeout);
  }


  // Compatibility adapters that convert AxiosResponse to BuilderResponse
  private convertAxiosResponse<T>(axiosResponse: AxiosResponse<T>): BuilderResponse<T> {
    return {
      status: axiosResponse.status,
      data: axiosResponse.data,
      headers: this.convertHeaders(axiosResponse.headers)
    };
  }

  private convertHeaders(axiosHeaders: any): Record<string, string | number | boolean> {
    const headers: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(axiosHeaders || {})) {
      if (value !== undefined && value !== null) {
        headers[key] = String(value);
      }
    }
    return headers;
  }

  private handleAxiosError(error: any): BuilderResponse<any> {
    if (error.response) {
      // HTTP error response (4xx, 5xx)
      return {
        status: error.response.status,
        data: error.response.data,
        headers: this.convertHeaders(error.response.headers)
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        data: {
          timestamp: new Date().toISOString(),
          status: 0,
          error: 'Network Error',
          message: 'No response received from server',
          path: error.config?.url || 'unknown'
        },
        headers: {}
      };
    } else {
      // Request setup error
      return {
        status: 0,
        data: {
          timestamp: new Date().toISOString(),
          status: 0,
          error: 'Request Error',
          message: error.message || 'Unknown error occurred',
          path: error.config?.url || 'unknown'
        },
        headers: {}
      };
    }
  }

  // Adapted user API methods for legacy compatibility with error handling
  async getAllUsersCompat(): Promise<BuilderResponse<UserResponse[]>> {
    try {
      const axiosResponse = await this.users.getAllUsers();
      return this.convertAxiosResponse(axiosResponse);
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async getUserByIdCompat(id: number): Promise<BuilderResponse<UserResponse>> {
    try {
      const axiosResponse = await this.users.getUserById(id);
      return this.convertAxiosResponse(axiosResponse);
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async createUserCompat(userData: UserCreateRequest): Promise<BuilderResponse<UserResponse>> {
    try {
      const axiosResponse = await this.users.createUser(userData);
      return this.convertAxiosResponse(axiosResponse);
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async updateUserCompat(id: number, userData: UserCreateRequest): Promise<BuilderResponse<UserResponse>> {
    try {
      const axiosResponse = await this.users.updateUser(id, userData);
      return this.convertAxiosResponse(axiosResponse);
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async deleteUserCompat(id: number): Promise<BuilderResponse<void>> {
    try {
      const axiosResponse = await this.users.deleteUser(id);
      return this.convertAxiosResponse(axiosResponse);
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async getHealthCompat(): Promise<BuilderResponse<HealthResponse>> {
    try {
      const axiosResponse = await axios.get(`${this.config.baseURL}/actuator/health`);
      return this.convertAxiosResponse(axiosResponse);
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }




  // Test lifecycle management
  async setupTest(description?: string): Promise<void> {
    if (this.config.enableLogging) {
      console.log(`🧪 Setting up test: ${description || 'Unknown test'}`);
    }

    // Wait for application to be ready
    await this.waitForHealthy();

    if (this.config.enableLogging) {
      console.log('✅ Test setup complete - application is healthy');
    }
  }

  async teardownTest(description?: string): Promise<void> {
    if (this.config.enableLogging) {
      console.log(`🧹 Tearing down test: ${description || 'Unknown test'}`);
    }

    // Optional: cleanup test data
    try {
      await this.testHelpers.cleanupAllTestUsers();
      if (this.config.enableLogging) {
        console.log('✅ Test data cleanup complete');
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn('⚠️ Test data cleanup failed:', error);
      }
    }
  }

  // Configuration methods
  withTimeout(timeout: number): ApiGateway {
    return new ApiGateway({
      ...this.config,
      timeout
    });
  }

  withRetry(retries: number, retryDelay?: number): ApiGateway {
    return new ApiGateway({
      ...this.config,
      retries,
      retryDelay: retryDelay || this.config.retryDelay
    });
  }

  withHeaders(headers: Record<string, string>): ApiGateway {
    return new ApiGateway({
      ...this.config,
      headers: { ...this.config.headers, ...headers }
    });
  }

  withAuth(token: string): ApiGateway {
    return this.withHeaders({ 'Authorization': `Bearer ${token}` });
  }

  withLogging(enabled: boolean = true): ApiGateway {
    return new ApiGateway({
      ...this.config,
      enableLogging: enabled
    });
  }

  // Static factory methods for common configurations
  static forLocal(port: number = 8080): ApiGateway {
    return new ApiGateway({
      baseURL: `http://localhost:${port}`,
      timeout: 10000,
      retries: 2,
      retryDelay: 1000
    });
  }

  static forTesting(baseURL?: string): ApiGateway {
    return new ApiGateway({
      baseURL: baseURL || 'http://localhost:8080',
      timeout: 30000,
      retries: 3,
      retryDelay: 2000,
      enableLogging: true
    });
  }

  static forCI(baseURL?: string): ApiGateway {
    return new ApiGateway({
      baseURL: baseURL || process.env.API_BASE_URL || 'http://localhost:8080',
      timeout: 60000,
      retries: 5,
      retryDelay: 3000,
      enableLogging: true
    });
  }

  private enableLogging(): void {
    // Add request/response interceptors for logging
    // This would require extending the generated clients or using axios interceptors
    if (this.config.enableLogging) {
      console.log(`🔗 ApiGateway initialized with baseURL: ${this.config.baseURL}`);
    }
  }

  // Health check and diagnostics
  async diagnose(): Promise<{
    healthy: boolean;
    info: any;
    userCount: number;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      const [healthy, dbState] = await Promise.allSettled([
        this.isHealthy(),
        this.testHelpers.getDatabaseState()
      ]);

      return {
        healthy: healthy.status === 'fulfilled' ? healthy.value : false,
        info: null,
        userCount: dbState.status === 'fulfilled' ? dbState.value.userCount : -1,
        timestamp
      };
    } catch (error) {
      return {
        healthy: false,
        info: null,
        userCount: -1,
        timestamp
      };
    }
  }
}