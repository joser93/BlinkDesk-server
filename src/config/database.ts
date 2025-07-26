import PocketBase from 'pocketbase';
import { env } from './environment.js';
import { logger } from '@/utils/logger.js';

// PocketBase client instance
export const pb = new PocketBase(env.POCKETBASE_URL);

// Database connection setup
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      // Test connection by getting server info
      await pb.health.check();
      
      // Try to authenticate as admin for setup purposes
      if (env.NODE_ENV === 'development') {
        try {
          await pb.admins.authWithPassword(
            env.POCKETBASE_ADMIN_EMAIL,
            env.POCKETBASE_ADMIN_PASSWORD
          );
          logger.info('Connected to PocketBase as admin');
        } catch (error) {
          logger.warn('Could not authenticate as admin, continuing as guest');
        }
      }

      this.isConnected = true;
      logger.info(`Connected to PocketBase at ${env.POCKETBASE_URL}`);
    } catch (error) {
      logger.error('Failed to connect to PocketBase:', error);
      throw new Error('Database connection failed');
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      pb.authStore.clear();
      this.isConnected = false;
      logger.info('Disconnected from PocketBase');
    }
  }

  public isConnectionActive(): boolean {
    return this.isConnected;
  }
}

// Collection names for type safety
export const Collections = {
  USERS: 'users',
  WORKSPACES: 'workspaces',
  LINKS: 'links',
  TASKS: 'tasks',
  WORKSPACE_SHARING: 'workspace_sharing',
  MONITORING_SESSIONS: 'monitoring_sessions',
  SESSION_TASK: 'session_task',
} as const;

export type CollectionName = typeof Collections[keyof typeof Collections];
