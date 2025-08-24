import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ErrorResponse } from '../../generated';

export interface BuilderConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: any;
}

export abstract class BaseBuilder {
  protected config: AxiosRequestConfig;
  protected retries: number;
  protected retryDelay: number;

  constructor(protected builderConfig: BuilderConfig) {
    this.config = {
      baseURL: builderConfig.baseURL,
      timeout: builderConfig.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...builderConfig.headers
      }
    };
    this.retries = builderConfig.retries || 0;
    this.retryDelay = builderConfig.retryDelay || 1000;
  }

  protected async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>
  ): Promise<ApiResponse<T>> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await requestFn();
        return {
          status: response.status,
          data: response.data,
          headers: response.headers
        };
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retries && this.shouldRetry(error as AxiosError)) {
          await this.sleep(this.retryDelay);
          continue;
        }
        
        break;
      }
    }

    return this.handleError<T>(lastError as AxiosError) as ApiResponse<T>;
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected handleError<T>(error: AxiosError): ApiResponse<T | ErrorResponse> {
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
        } as ErrorResponse,
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
        } as ErrorResponse,
        headers: {}
      };
    }
  }

  // Fluent API methods for configuration
  withTimeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  withRetry(retries: number, retryDelay: number = 1000): this {
    this.retries = retries;
    this.retryDelay = retryDelay;
    return this;
  }

  withHeaders(headers: Record<string, string>): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  withAuth(token: string): this {
    this.config.headers = {
      ...this.config.headers,
      'Authorization': `Bearer ${token}`
    };
    return this;
  }
}