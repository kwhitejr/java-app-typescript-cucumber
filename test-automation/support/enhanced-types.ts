// Re-export all generated types
export * from '../generated';

// Import specific types for extension
import { 
  UserResponse as GeneratedUserResponse,
  UserCreateRequest as GeneratedUserCreateRequest,
  ErrorResponse as GeneratedErrorResponse 
} from '../generated';

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

// Query and filter types for builders
export interface UserFilters {
  nameContains?: string;
  emailDomain?: string;
  hasbio?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  isActive?: boolean;
}

export interface SortOptions {
  field: 'id' | 'name' | 'email' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  offset?: number;
  limit?: number;
}

// Test scenario types
export interface TestScenario {
  name: string;
  description?: string;
  tags?: string[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  expectedUsers?: EnhancedUserResponse[];
  expectedErrors?: GeneratedErrorResponse[];
}

// Validation types for test assertions
export interface ValidationRule<T> {
  name: string;
  validate: (data: T) => boolean | Promise<boolean>;
  errorMessage: string;
}

export interface UserValidationRules {
  name?: ValidationRule<string>[];
  email?: ValidationRule<string>[];
  bio?: ValidationRule<string>[];
  id?: ValidationRule<number>[];
}

// API monitoring and metrics types
export interface ApiMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  error?: string;
}

export interface TestMetrics {
  scenario: string;
  duration: number;
  apiCalls: ApiMetrics[];
  assertions: number;
  passed: boolean;
  errors?: string[];
}

// Configuration types
export interface TestConfiguration {
  baseURL: string;
  timeout: number;
  retries: number;
  parallel: boolean;
  cleanup: boolean;
  logging: boolean;
  reporting: {
    formats: ('json' | 'html' | 'junit')[];
    directory: string;
  };
}

// Custom error types for better error handling
export class ApiTestError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiTestError';
  }
}

export class TestSetupError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'TestSetupError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public expectedValue?: any,
    public actualValue?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
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

export const isApiError = (error: any): error is ApiTestError => {
  return error instanceof ApiTestError;
};