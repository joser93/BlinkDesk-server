import { object } from "zod";
import { Collections } from "../config/database";
import { BaseRecord } from "./BaseRecord";
import { User } from "./UserTypes";
import { Workspace } from "./WorkspaceType";
import { CollectionSchema, ColSchemaType, SchemaRelationOptions, SchemaType, SelectSchemaOptions } from "./CollectionSchema";

// Monitoring types
export interface MonitoringSession extends BaseRecord {
  workspaceId: string; // Workspace ID
  userId: string; // User ID
  startedAt: Date;
  completedAt?: Date;
  status: SessionStatus;
  data: SessionData;
  expand?: {
    workspace?: Workspace;
    user?: User;
  },
  sessionTasks?: SessionTask[];
}

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  PAUSED = 'paused',
}

export const MonitorSessionSchema : CollectionSchema = {
    name: Collections.MONITORING_SESSIONS,
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
        name: 'startedAt',
        type: SchemaType.DATE,
        required: true
      },
      {
        name: 'completedAt',
        type: SchemaType.DATE,
      },
      {
        name: 'status',
        type: SchemaType.SELECT,
        required: true,
        values: Object.keys(SessionStatus).map( (i) => SessionStatus[i] )
      } as SelectSchemaOptions,
      {
        name: 'data',
        type: SchemaType.JSON,
        required: true
      }
    ],
    indexes: [
      'CREATE INDEX idx_monitoring_workspace ON monitoring_sessions (workspace)',
      'CREATE INDEX idx_monitoring_user ON monitoring_sessions (user)',
      'CREATE INDEX idx_monitoring_status ON monitoring_sessions (status)',
      'CREATE INDEX idx_monitoring_started ON monitoring_sessions (startedAt)'
    ],
    listRule: '@request.auth.id ?= workspace.owner || user = @request.auth.id || (@request.auth.id ?~ workspace.workspace_sharing_via_workspace.user && workspace.workspace_sharing_via_workspace.permissions.canViewStats = true)',
    viewRule: '@request.auth.id ?= workspace.owner || user = @request.auth.id || (@request.auth.id ?~ workspace.workspace_sharing_via_workspace.user && workspace.workspace_sharing_via_workspace.permissions.canViewStats = true)',
    createRule: '@request.auth.id != "" && (@request.auth.id ?= workspace.owner || workspace.isPublic = true || @request.auth.id ?~ workspace.workspace_sharing_via_workspace.user)',
    updateRule: 'user = @request.auth.id',
    deleteRule: '@request.auth.id ?= workspace.owner || user = @request.auth.id'
  }

export interface SessionData {
  totalTime?: number; // in milliseconds
  averageTimePerTask?: number;
  notes?: string;
}

export interface SessionTask extends BaseRecord{
  sessionId: string;
  taskId: string;
  linkId: string;
  isCompleted: boolean;
  reason: string;
  completedAt?: Date;
  timeSpent?: number;
}

export const SessionTaskSchema: CollectionSchema = {
  name: Collections.SESSION_TASK,
  type: ColSchemaType.BASE,
  fields: [
    { 
      name: "session",
      type: SchemaType.RELATION,
      required: true,
      collectionName: Collections.MONITORING_SESSIONS,
      maxSelect: 1
    }as SchemaRelationOptions,
    {
      name: "task",
      type: SchemaType.RELATION,
      required: true,
      collectionName: Collections.TASKS,
    } as SchemaRelationOptions,
    {
      name: "link",
      type: SchemaType.RELATION,
      required: true,
      collectionName: Collections.LINKS,
    } as SchemaRelationOptions,
    {
      name: "isCompleted",
      type: SchemaType.BOOLEAN
    },
    {
      name: "reason",
      type: SchemaType.TEXT
    },
    {
      name: "completedAt",
      type: SchemaType.DATE
    },
    {
      name: "timeSpent",
      type: SchemaType.NUMBER
    }
  ]
}