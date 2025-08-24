import axios, { AxiosError } from 'axios';
import { BaseBuilder, BuilderConfig, ApiResponse } from './base-builder';
import { UserResponse, ErrorResponse } from '../../generated';

export interface UserQueryOptions {
  search?: string;
  sortBy?: 'name' | 'email' | 'id';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
}

export interface UserBulkOperation {
  userIds: number[];
  operation: 'delete' | 'activate' | 'deactivate';
}

export class UserQueryBuilder extends BaseBuilder {
  private queryOptions: UserQueryOptions = {};

  constructor(config: BuilderConfig) {
    super(config);
  }

  // Query building methods
  search(term: string): this {
    this.queryOptions.search = term;
    return this;
  }

  sortBy(field: 'name' | 'email' | 'id', order: 'asc' | 'desc' = 'asc'): this {
    this.queryOptions.sortBy = field;
    this.queryOptions.sortOrder = order;
    return this;
  }

  limit(count: number): this {
    this.queryOptions.limit = count;
    return this;
  }

  offset(start: number): this {
    this.queryOptions.offset = start;
    return this;
  }

  paginate(page: number, pageSize: number): this {
    this.queryOptions.limit = pageSize;
    this.queryOptions.offset = (page - 1) * pageSize;
    return this;
  }

  includeInactive(include: boolean = true): this {
    this.queryOptions.includeInactive = include;
    return this;
  }

  // Execution methods
  async execute(): Promise<ApiResponse<UserResponse[]>> {
    const params = new URLSearchParams();
    
    if (this.queryOptions.search) {
      params.append('search', this.queryOptions.search);
    }
    if (this.queryOptions.sortBy) {
      params.append('sortBy', this.queryOptions.sortBy);
      params.append('sortOrder', this.queryOptions.sortOrder || 'asc');
    }
    if (this.queryOptions.limit !== undefined) {
      params.append('limit', this.queryOptions.limit.toString());
    }
    if (this.queryOptions.offset !== undefined) {
      params.append('offset', this.queryOptions.offset.toString());
    }
    if (this.queryOptions.includeInactive !== undefined) {
      params.append('includeInactive', this.queryOptions.includeInactive.toString());
    }

    const url = `/api/users${params.toString() ? '?' + params.toString() : ''}`;

    return this.executeWithRetry(() => axios.get(url, this.config));
  }

  async findByEmail(email: string): Promise<ApiResponse<UserResponse | null>> {
    const url = `/api/users?search=${encodeURIComponent(email)}`;
    
    const response = await this.executeWithRetry<UserResponse[]>(
      () => axios.get(url, this.config)
    );

    if (response.status === 200 && Array.isArray(response.data)) {
      const user = response.data.find(u => u.email === email);
      return {
        ...response,
        data: user || null
      };
    }

    return response as ApiResponse<UserResponse | null>;
  }

  async findByIds(ids: number[]): Promise<ApiResponse<UserResponse[]>> {
    const promises = ids.map(id => 
      this.executeWithRetry<UserResponse>(
        () => axios.get(`/api/users/${id}`, this.config)
      )
    );

    try {
      const responses = await Promise.allSettled(promises);
      const users: UserResponse[] = [];
      
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.status === 200) {
          users.push(response.value.data);
        }
      });

      return {
        status: 200,
        data: users,
        headers: {}
      };
    } catch (error) {
      return this.handleError<UserResponse[]>(error as AxiosError) as ApiResponse<UserResponse[]>;
    }
  }

  // Bulk operations
  async bulkDelete(userIds: number[]): Promise<ApiResponse<{ deleted: number[], failed: number[] }>> {
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

    return {
      status: 200,
      data: results,
      headers: {}
    };
  }

  // Reset query options for reuse
  reset(): this {
    this.queryOptions = {};
    return this;
  }
}