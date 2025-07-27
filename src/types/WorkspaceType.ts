import { Collections } from "../config/database";
import { BaseRecord } from "./BaseRecord";
import { CollectionSchema, ColSchemaType, SchemaRelationOptions, SchemaType, SelectSchemaOptions } from "./CollectionSchema";
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

export const WorkspaceSchema: CollectionSchema = {
    name: Collections.WORKSPACES,
    type: ColSchemaType.BASE,
    fields: [
      {
        name: 'name',
        type: SchemaType.TEXT,
        required: true,
        max: 100
      },
      {
        name: 'description',
        type: SchemaType.TEXT,
        required: false,
        max: 500
      },
      {
        name: 'owner',
        type: SchemaType.RELATION,
        required: true,
        collectionName: Collections.USERS,
        cascadeDelete: true,
        maxSelect: 1
      },
      {
        name: 'color',
        type: SchemaType.TEXT,
        required: false,
        max: 7
      },
      {
        name: 'icon',
        type: SchemaType.TEXT,
        max: 50
      },
      {
        name: 'isPublic',
        type: SchemaType.BOOLEAN,
        required: true,
      },
      {
        name: 'settings',
        type: SchemaType.JSON,
        required: true,
      },
      {
        name: 'stats',
        type: SchemaType.JSON,
      }
    ],
    indexes: [
      'CREATE INDEX idx_workspaces_owner ON workspaces (owner)',
      'CREATE INDEX idx_workspaces_public ON workspaces (isPublic)'
    ],
    createRule: '@request.auth.id != ""',
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

export enum ShareRole {
  VIEWER = 'viewer',
  COLLABORATOR = 'collaborator',
  ADMIN = 'admin'
}

export const WorkspaceShareColSchema : CollectionSchema = {
    name: Collections.WORKSPACE_SHARING,
    type: ColSchemaType.BASE,
    fields: [
      {
        name: 'workspace',
        type: SchemaType.RELATION,
        required: true,
        collectionName: Collections.WORKSPACES,
        cascadeDelete: true,
        maxSelect: 1
      } as SchemaRelationOptions,
      {
        name: 'user',
        type: SchemaType.RELATION,
        required: true,
        collectionName: Collections.USERS,
        cascadeDelete: true,
        maxSelect: 1
      } as SchemaRelationOptions,
      {
        name: 'role',
        type: SchemaType.SELECT,
        required: true,
        values: Object.keys(ShareRole).map( (i) => ShareRole[i] )
        
      } as SelectSchemaOptions,
      {
        name: 'permissions',
        type: SchemaType.JSON,
        required: true,
      },
      {
        name: 'invitedBy',
        type: SchemaType.RELATION,
        required: true,
        collectionName: Collections.USERS,
        maxSelect: 1
      } as SchemaRelationOptions,
      {
        name: 'acceptedAt',
        type: SchemaType.DATE
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