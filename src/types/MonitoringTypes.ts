import { BaseRecord } from "./BaseRecord";
import { Link } from "./Link";
import { Task } from "./TaskTypes.ts";
import { UserSettings } from "./UserTypes";
import { Workspace } from "./WorkspaceType";

// Monitoring types
export interface MonitoringSession extends BaseRecord {
  workspace: Workspace; // Workspace ID
  user: UserSettings; // User ID
  startedAt: Date;
  completedAt?: Date;
  status: SessionStatus;
  totalTasks: number;
  completedTasks: number;
  data: SessionData;
}

export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'paused';

export interface SessionData {
  SessionTasks: SessionTask[];
  totalTime?: number; // in milliseconds
  averageTimePerTask?: number;
  notes?: string;
}

export interface SessionTask {
  
  taskId: Task;
  linkId: Link;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent?: number;
}