import { BaseRecord } from "./BaseRecord";
import { Task } from "./TaskTypes";
import { Workspace } from "./WorkspaceType";

// Link types
export interface Link extends BaseRecord {
  workspaceId: string; // Workspace ID
  title: string;
  url: string;
  order: number;
  isActive: boolean;
  favicon?: string;
  expand? : {
    tasks: Task[];
  }
}

// Request Types
export interface CreateLinkRequest {
  workspace: Workspace;
  title: string;
  url: string;
  description?: string;
  category?: string;
  tags?: string[];
}