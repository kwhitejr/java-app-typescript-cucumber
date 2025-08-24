// Re-export all generated types
export * from '../generated';

// Import specific types for extension
import { 
  UserResponse as GeneratedUserResponse,
  UserCreateRequest as GeneratedUserCreateRequest,
  ErrorResponse as GeneratedErrorResponse 
} from '../generated';

// Manual actuator types (not included in OpenAPI spec as they are boilerplate)
export interface HealthResponse {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN';
  components?: {
    [componentName: string]: {
      status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN';
      [additionalProperty: string]: any;
    };
  };
}

// Enhanced types with test-specific extensions
export interface EnhancedUserResponse extends GeneratedUserResponse {
  // Add any test-specific properties or methods
  _testMetadata?: {
    createdInTest?: string;
    shouldCleanup?: boolean;
  };
}

export interface EnhancedUserCreateRequest extends GeneratedUserCreateRequest {
  // Add any test-specific validation or properties
  _skipValidation?: boolean;
}

// Test context types
export interface TestContext {
  response?: BuilderResponse<unknown>;
  currentUser?: EnhancedUserResponse;
  createdUsers: EnhancedUserResponse[];
  lastError?: GeneratedErrorResponse;
  userData?: GeneratedUserCreateRequest;
  testMetadata?: {
    testName?: string;
    startTime?: Date;
    tags?: string[];
  };
}

// Builder pattern response types
export interface BuilderResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string | number | boolean>;
  metadata?: {
    requestTime?: number;
    retryCount?: number;
    fromCache?: boolean;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type TestDataFactory<T> = (overrides?: DeepPartial<T>) => T;

export type AsyncTestStep<T> = () => Promise<T>;

// Export commonly used type guards
export const isUserResponse = (obj: any): obj is EnhancedUserResponse => {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj && 'email' in obj;
};

export const isErrorResponse = (obj: any): obj is GeneratedErrorResponse => {
  return obj && typeof obj === 'object' && 'status' in obj && 'error' in obj && 'message' in obj;
};