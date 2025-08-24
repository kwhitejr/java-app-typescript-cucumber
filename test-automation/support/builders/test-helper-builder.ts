import axios from 'axios';
import { BaseBuilder, BuilderConfig, ApiResponse } from './base-builder';
import { UserResponse, UserCreateRequest } from '../../generated';

export interface WaitCondition<T> {
  condition: () => Promise<T>;
  timeout?: number;
  interval?: number;
  description?: string;
}

export interface TestDataTemplate {
  users: Partial<UserCreateRequest>[];
}

export class TestHelperBuilder extends BaseBuilder {
  constructor(config: BuilderConfig) {
    super(config);
  }

  // Wait conditions for testing
  async waitForCondition<T>(
    condition: () => Promise<T>, 
    timeout: number = 30000, 
    interval: number = 1000,
    description: string = 'condition'
  ): Promise<T | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          return result;
        }
      } catch (error) {
        // Ignore errors and continue polling
      }
      
      await this.sleep(interval);
    }
    
    throw new Error(`Timeout waiting for ${description} after ${timeout}ms`);
  }

  async waitForUserExists(userId: number, timeout: number = 30000): Promise<UserResponse> {
    const result = await this.waitForCondition(
      async () => {
        const response = await this.executeWithRetry<UserResponse>(
          () => axios.get(`/api/users/${userId}`, this.config)
        );
        return response.status === 200 ? response.data : null;
      },
      timeout,
      1000,
      `user ${userId} to exist`
    );
    
    if (!result) {
      throw new Error(`User ${userId} was not found within timeout`);
    }
    
    return result;
  }

  async waitForUserDeleted(userId: number, timeout: number = 30000): Promise<boolean> {
    const result = await this.waitForCondition(
      async () => {
        const response = await this.executeWithRetry<UserResponse>(
          () => axios.get(`/api/users/${userId}`, this.config)
        );
        return response.status === 404;
      },
      timeout,
      1000,
      `user ${userId} to be deleted`
    );
    
    return result !== null ? result : false;
  }

  async waitForUserCount(expectedCount: number, timeout: number = 30000): Promise<boolean> {
    const result = await this.waitForCondition(
      async () => {
        const response = await this.executeWithRetry<UserResponse[]>(
          () => axios.get('/api/users', this.config)
        );
        return response.status === 200 && response.data.length === expectedCount;
      },
      timeout,
      1000,
      `user count to be ${expectedCount}`
    );
    
    return result !== null ? result : false;
  }

  async waitForHealthy(timeout: number = 60000): Promise<boolean> {
    const result = await this.waitForCondition(
      async () => {
        try {
          const response = await axios.get(`${this.config.baseURL}/actuator/health`, {
            ...this.config,
            timeout: 5000
          });
          return response.status === 200 && response.data.status === 'UP';
        } catch {
          return false;
        }
      },
      timeout,
      2000,
      'application to be healthy'
    );
    
    return result !== null ? result : false;
  }

  // Test data creation helpers
  async createTestUsers(count: number, template?: Partial<UserCreateRequest>): Promise<UserResponse[]> {
    const defaultTemplate: UserCreateRequest = {
      name: 'Test User',
      email: 'test@example.com',
      bio: 'Test user bio'
    };

    const users: UserResponse[] = [];
    const promises: Promise<ApiResponse<UserResponse>>[] = [];

    for (let i = 0; i < count; i++) {
      const userData: UserCreateRequest = {
        ...defaultTemplate,
        ...template,
        name: `${template?.name || defaultTemplate.name} ${i + 1}`,
        email: `${template?.email?.split('@')[0] || 'test'}${i + 1}@${template?.email?.split('@')[1] || 'example.com'}`
      };

      promises.push(
        this.executeWithRetry<UserResponse>(
          () => axios.post('/api/users', userData, this.config)
        )
      );
    }

    const responses = await Promise.allSettled(promises);
    
    responses.forEach((response, index) => {
      if (response.status === 'fulfilled' && response.value.status === 201) {
        users.push(response.value.data);
      } else {
        console.warn(`Failed to create test user ${index + 1}:`, response);
      }
    });

    return users;
  }

  async cleanupTestUsers(userIds: number[]): Promise<{ deleted: number[], failed: number[] }> {
    const results = { deleted: [] as number[], failed: [] as number[] };
    
    const promises = userIds.map(async (id) => {
      try {
        const response = await this.executeWithRetry(
          () => axios.delete(`/api/users/${id}`, this.config)
        );
        if (response.status === 204) {
          results.deleted.push(id);
        } else {
          results.failed.push(id);
        }
      } catch (error) {
        results.failed.push(id);
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  async cleanupAllTestUsers(pattern: string = 'Test User'): Promise<{ deleted: number[], failed: number[] }> {
    const response = await this.executeWithRetry<UserResponse[]>(
      () => axios.get('/api/users', this.config)
    );

    if (response.status !== 200) {
      return { deleted: [], failed: [] };
    }

    const testUsers = response.data.filter(user => 
      user.name?.includes(pattern) || user.email?.includes('test')
    );

    if (testUsers.length === 0) {
      return { deleted: [], failed: [] };
    }

    return this.cleanupTestUsers(testUsers.map(user => user.id!));
  }

  // Database state verification
  async verifyDatabaseEmpty(): Promise<boolean> {
    const response = await this.executeWithRetry<UserResponse[]>(
      () => axios.get('/api/users', this.config)
    );
    
    return response.status === 200 && response.data.length === 0;
  }

  async getDatabaseState(): Promise<{
    userCount: number;
    users: UserResponse[];
    lastUserId?: number;
  }> {
    const response = await this.executeWithRetry<UserResponse[]>(
      () => axios.get('/api/users', this.config)
    );
    
    if (response.status !== 200) {
      throw new Error(`Failed to get database state: ${response.status}`);
    }

    const users = response.data;
    const lastUserId = users.length > 0 ? Math.max(...users.map(u => u.id!)) : undefined;

    return {
      userCount: users.length,
      users,
      lastUserId
    };
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}