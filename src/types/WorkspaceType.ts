import { BaseRecord } from "./BaseRecord";
import { Link } from "./Link";
import { User } from "./UserTypes";

export interface Workspace extends BaseRecord {
  name: string;
  description?: string;
  owner: User;
  color?: string;
  icon?: string;
  isPublic: boolean;
  settings: WorkspaceSettings;
  stats?: WorkspaceStats;
  expand?: {
    links: Link[];
    sharedPermissions: SharePermissions[];
  }
}

export interface WorkspaceSettings {
  enableMonitoring: boolean;
  requireCompletionOrder: boolean;
  allowGuestAccess: boolean;
  autoArchive: boolean;
}

export interface WorkspaceStats {
  totalLinks: number;
  totalTasks: number;
  totalExecutions: number;
  averageCompletionTime?: number;
  lastExecuted?: string;

}

// Workspace sharing types
export interface WorkspaceSharing extends BaseRecord {
  workspaceId: string;
  userId: string;
  role: ShareRole;
  permissions: SharePermissions;
  invitedById: string;
  acceptedAt?: Date;
  expand?: {
    userToShare: User;
    invitedBy: User;
  }
}

export type ShareRole = 'viewer' | 'collaborator' | 'admin';

export interface SharePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExecute: boolean;
  canViewStats: boolean;
}

// Request types
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
  settings?: Partial<WorkspaceSettings>;
}

export interface UpdateWorkspaceRequest extends Partial<CreateWorkspaceRequest> {
  id: string;
}

export interface ShareWorkspaceRequest {
  workspaceId: string;
  userId: string;
  role: ShareRole;
  permissions?: Partial<SharePermissions>;
}