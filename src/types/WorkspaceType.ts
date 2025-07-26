import { Collections } from "../config/database";
import { BaseRecord } from "./BaseRecord";
import { Link } from "./Link";
import { User } from "./UserTypes";

export interface Workspace extends BaseRecord {
  name: string;
  description?: string;
  ownerId: string;
  color?: string;
  icon?: string;
  isPublic: boolean;
  settings: WorkspaceSettings;
  stats?: WorkspaceStats;
  expand?: {
    owner?: User;
    links?: Link[];
    sharedPermissions?: SharePermissions[];
  }
}

const WorkspaceSchema: CollectionSchema = {
    name: Collections.WORKSPACES,
    type: ColSchemaType.BASE,
    schema: [
      {
        name: 'name',
        type: SchemaType.TEXT,
        required: true,
        options: { max: 100 }
      },
      {
        name: 'description',
        type: SchemaType.TEXT,
        required: false,
        options: { max: 500 }
      },
      {
        name: 'owner',
        type: SchemaType.RELATION,
        required: true,
        options: { 
          collectionId: Collections.USERS,
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'color',
        type: SchemaType.TEXT,
        required: false,
        options: { max: 7 }
      },
      {
        name: 'icon',
        type: SchemaType.TEXT,
        required: false,
        options: { max: 50 }
      },
      {
        name: 'isPublic',
        type: SchemaType.BOOLEAN,
        required: true,
        options: {}
      },
      {
        name: 'settings',
        type: SchemaType.JSON,
        required: true,
        options: {}
      },
      {
        name: 'stats',
        type: SchemaType.JSON,
        required: false,
        options: {}
      }
    ],
    indexes: [
      'CREATE INDEX idx_workspaces_owner ON workspaces (owner)',
      'CREATE INDEX idx_workspaces_public ON workspaces (isPublic)'
    ],
    listRule: 'owner = @request.auth.id || isPublic = true || @request.auth.id ?~ workspace_sharing_via_workspace.user',
    viewRule: 'owner = @request.auth.id || isPublic = true || @request.auth.id ?~ workspace_sharing_via_workspace.user',
    createRule: '@request.auth.id != ""',
    updateRule: 'owner = @request.auth.id || (@request.auth.id ?~ workspace_sharing_via_workspace.user && workspace_sharing_via_workspace.permissions.canEdit = true)',
    deleteRule: 'owner = @request.auth.id'
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
    userToShare?: User;
    invitedBy?: User;
    workspace?: Workspace
  }
}

const WorkspaceShareColSchema : CollectionSchema = {
    name: Collections.WORKSPACE_SHARING,
    type: ColSchemaType.BASE,
    schema: [
      {
        name: 'workspace',
        type: SchemaType.RELATION,
        required: true,
        options: {
          collectionId: Collections.WORKSPACES,
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'user',
        type: SchemaType.RELATION,
        required: true,
        options: {
          collectionId: Collections.USERS,
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: 'role',
        type: 'select',
        required: true,
        options: {
          values: ['viewer', 'collaborator', 'admin']
        }
      },
      {
        name: 'permissions',
        type: SchemaType.JSON,
        required: true,
        options: {}
      },
      {
        name: 'invitedBy',
        type: SchemaType.RELATION,
        required: true,
        options: {
          collectionId: Collections.USERS,
          maxSelect: 1
        }
      },
      {
        name: 'acceptedAt',
        type: SchemaType.DATE,
        required: false,
        options: {}
      }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_workspace_sharing_unique ON workspace_sharing (workspace, user)',
      'CREATE INDEX idx_workspace_sharing_user ON workspace_sharing (user)'
    ],
    listRule: '@request.auth.id ?= workspace.owner || user = @request.auth.id',
    viewRule: '@request.auth.id ?= workspace.owner || user = @request.auth.id',
    createRule: '@request.auth.id ?= workspace.owner || (@request.auth.id ?= invitedBy && @request.auth.id ?~ workspace.workspace_sharing_via_workspace.user && workspace.workspace_sharing_via_workspace.permissions.canShare = true)',
    updateRule: '@request.auth.id ?= workspace.owner || user = @request.auth.id',
    deleteRule: '@request.auth.id ?= workspace.owner || user = @request.auth.id'
  };

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