import axios, { AxiosResponse, AxiosError } from 'axios';
import { User, UserCreateRequest, ApiResponse, ErrorResponse } from './types';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const API_ENDPOINT = `${BASE_URL}/api/users`;
const ACTUATOR_ENDPOINT = `${BASE_URL}/actuator`;

export class ApiClient {
  private static instance: ApiClient;

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private constructor() {
    axios.defaults.timeout = 10000;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }

  async getAllUsers(): Promise<ApiResponse<User[] | ErrorResponse>> {
    try {
      const response: AxiosResponse<User[]> = await axios.get(API_ENDPOINT);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError) as ApiResponse<User[] | ErrorResponse>;
    }
  }

  async getUserById(id: number): Promise<ApiResponse<User | ErrorResponse>> {
    try {
      const response: AxiosResponse<User> = await axios.get(`${API_ENDPOINT}/${id}`);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async createUser(userData: UserCreateRequest): Promise<ApiResponse<User | ErrorResponse>> {
    try {
      const response: AxiosResponse<User> = await axios.post(API_ENDPOINT, userData);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async updateUser(id: number, userData: UserCreateRequest): Promise<ApiResponse<User | ErrorResponse>> {
    try {
      const response: AxiosResponse<User> = await axios.put(`${API_ENDPOINT}/${id}`, userData);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async deleteUser(id: number): Promise<ApiResponse<void | ErrorResponse>> {
    try {
      const response: AxiosResponse<void> = await axios.delete(`${API_ENDPOINT}/${id}`);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getActuatorHealth(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<any> = await axios.get(`${ACTUATOR_ENDPOINT}/health`);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getActuatorInfo(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<any> = await axios.get(`${ACTUATOR_ENDPOINT}/info`);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getActuatorMetrics(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<any> = await axios.get(`${ACTUATOR_ENDPOINT}/metrics`);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getActuatorEndpoint(endpoint: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<any> = await axios.get(`${ACTUATOR_ENDPOINT}/${endpoint}`);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async waitForApi(maxRetries: number = 30, intervalMs: number = 1000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const isHealthy = await this.healthCheck();
      if (isHealthy) {
        return true;
      }
      console.log(`API not ready, retrying in ${intervalMs}ms... (${i + 1}/${maxRetries})`);
      await this.sleep(intervalMs);
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: AxiosError): ApiResponse<ErrorResponse> {
    if (error.response) {
      return {
        status: error.response.status,
        data: error.response.data as ErrorResponse,
        headers: error.response.headers
      };
    } else if (error.request) {
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
}