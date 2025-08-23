export interface User {
  id?: number;
  name: string;
  email: string;
  bio?: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  bio?: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: string[];
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: any;
}

export interface TestContext {
  response?: ApiResponse;
  currentUser?: User;
  createdUsers: User[];
  lastError?: ErrorResponse;
}