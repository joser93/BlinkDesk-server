import { BaseRecord } from "./BaseRecord";
import { Link } from "./Link";
import { MonitoringSession } from "./MonitoringTypes";

export interface Task extends BaseRecord {
  link: Link;
  title: string;
  description?: string;
  order: number;
  config: TaskValidation;
}

export interface TaskValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface CreateTaskRequest {
  link: Link;
  title: string;
  description?: string;
  isRequired?: boolean;
}

export interface StartMonitoringRequest {
  workspace: string;
}

export interface CompleteTaskRequest {
  sessionId: string;
  taskId: string;
  timeSpent?: number;
}