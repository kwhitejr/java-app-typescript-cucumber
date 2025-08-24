// Import and re-export generated types for convenience
import type { 
  UserResponse, 
  UserCreateRequest, 
  ErrorResponse
} from '../generated';

// Import manual types for actuator endpoints (not in OpenAPI spec)
import type {
  HealthResponse
} from './enhanced-types';

export type { 
  UserResponse, 
  UserCreateRequest, 
  ErrorResponse,
  HealthResponse
};

// Enhanced API response wrapper
export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string | number | boolean>;
}

// Test-specific context interface using generated types
export interface TestContext {
  response?: ApiResponse<unknown>;
  currentUser?: UserResponse;
  createdUsers: UserResponse[];
  lastError?: ErrorResponse;
  userData?: UserCreateRequest;
}