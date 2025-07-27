import { Collections } from "../config/database";
import { BaseRecord } from "./BaseRecord";
import { BasicSchemaOptions, CollectionSchema, ColSchemaType, SchemaRelationOptions, SchemaType } from "./CollectionSchema";
import { Link } from "./Link";
import { MonitoringSession } from "./MonitoringTypes";

export interface Task extends BaseRecord {
  link: Link;
  title: string;
  description?: string;
  order: number;
  validations: TaskValidation;
}

export interface TaskValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export const TaskCollectionSchema : CollectionSchema = {
    name: Collections.TASKS,
    type: ColSchemaType.BASE,
    fields: [
      {
        name: 'link',
        type: SchemaType.RELATION,
        required: true,
        collectionName: Collections.LINKS,
        cascadeDelete: true,
        maxSelect: 1
      } as SchemaRelationOptions,
      {
        name: 'title',
        type: SchemaType.TEXT,
        required: true,
        max: 200
      } as BasicSchemaOptions,
      {
        name: 'description',
        type: SchemaType.TEXT,
        max: 1000
      } as BasicSchemaOptions,
      {
        name: 'isRequired',
        type: SchemaType.BOOLEAN,
        required: true,
      },
      {
        name: 'order',
        type: SchemaType.NUMBER,
        required: true,
        min: 0
      } as BasicSchemaOptions,
      {
        name: 'validations',
        type: SchemaType.JSON,
        required: true
      }
    ],
    indexes: [
      'CREATE INDEX idx_tasks_link ON tasks (link)',
      'CREATE INDEX idx_tasks_order ON tasks (`order`)'
    ],
    listRule: '@request.auth.id ?= link.workspace.owner || link.workspace.isPublic = true || @request.auth.id ?~ link.workspace.workspace_sharing_via_workspace.user',
    viewRule: '@request.auth.id ?= link.workspace.owner || link.workspace.isPublic = true || @request.auth.id ?~ link.workspace.workspace_sharing_via_workspace.user',
    createRule: '@request.auth.id ?= link.workspace.owner || (@request.auth.id ?~ link.workspace.workspace_sharing_via_workspace.user && link.workspace.workspace_sharing_via_workspace.permissions.canEdit = true)',
    updateRule: '@request.auth.id ?= link.workspace.owner || (@request.auth.id ?~ link.workspace.workspace_sharing_via_workspace.user && link.workspace.workspace_sharing_via_workspace.permissions.canEdit = true)',
    deleteRule: '@request.auth.id ?= link.workspace.owner || (@request.auth.id ?~ link.workspace.workspace_sharing_via_workspace.user && link.workspace.workspace_sharing_via_workspace.permissions.canDelete = true)'
  }

export interface CreateTaskRequest {
  linkId: string;
  title: string;
  description?: string;
  isRequired?: boolean;
}

export interface StartMonitoringRequest {
  workspaceId: string;
}

export interface CompleteTaskRequest {
  sessionId: string;
  taskId: string;
  timeSpent?: number;
}