import { BaseRecord } from "./BaseRecord";

export interface User extends BaseRecord {
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  verified: boolean;
  settings?: UserSettings;
  password: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  defaultMonitoring: boolean;
  language: string;
}


export interface CreateUserRequest {
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  settings?: UserSettings;
  password?: string;
}

export interface ValidateUser {
  user: User;
}