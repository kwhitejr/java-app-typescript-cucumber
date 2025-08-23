import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { ApiClient } from './api-client';
import { TestContext } from './types';

export class CustomWorld extends World implements TestContext {
  public apiClient: ApiClient;
  public response?: any;
  public currentUser?: any;
  public createdUsers: any[] = [];
  public lastError?: any;
  public userData?: any;

  constructor(options: IWorldOptions) {
    super(options);
    this.apiClient = ApiClient.getInstance();
    this.createdUsers = [];
  }

  public reset(): void {
    this.response = undefined;
    this.currentUser = undefined;
    this.lastError = undefined;
    this.userData = undefined;
  }

  public addCreatedUser(user: any): void {
    this.createdUsers.push(user);
  }

  public getLastCreatedUser(): any {
    return this.createdUsers[this.createdUsers.length - 1];
  }
}

setWorldConstructor(CustomWorld);