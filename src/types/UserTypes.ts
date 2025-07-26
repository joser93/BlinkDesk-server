import { Collections } from "../config/database";
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

export const UserSchema: CollectionSchema  = {
  name: Collections.USERS,
  type: ColSchemaType.AUTH,
  schema: [
    {
      name: "name",
      type: SchemaType.TEXT,
      required: false,
      options: {
        max: 100
      }
    },
    {
      name: "avatar",
      type: SchemaType.FILE,
      required: false,
      options: {
        maxSelect: 1,
        maxSize: 5242880
      }
    },
    {
      name: "settings",
      type: SchemaType.JSON,
      required: false
    }
  ],
  ,
  indexes: ['CREATE UNIQUE INDEX idx_users_email ON users (email)'],
  listRule: 'id = @request.auth.id',
  viewRule: 'id = @request.auth.id',
  createRule: '',
  updateRule: 'id = @request.auth.id',
  deleteRule: 'id = @request.auth.id'
};

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