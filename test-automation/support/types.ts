// Import and re-export generated types for convenience
import type { 
  UserResponse, 
  UserCreateRequest, 
  ErrorResponse,
  HealthResponse,
  InfoResponse,
  MetricsResponse
} from '../generated';

export type { 
  UserResponse, 
  UserCreateRequest, 
  ErrorResponse,
  HealthResponse,
  InfoResponse,
  MetricsResponse
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