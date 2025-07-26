import { Collections } from "../config/database";
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
  workspaceId: string;
  title: string;
  url: string;
}

export const LinkSchema : CollectionSchema = {
    name: Collections.LINKS,
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
        name: 'title',
        type: SchemaType.TEXT,
        required: true,
        options: { max: 200 }
      },
      {
        name: 'url',
        type: SchemaType.URL,
        required: true
      },
      {
        name: 'order',
        type: SchemaType.NUMBER,
        required: true,
        options: { min: 0 }
      },
      {
        name: 'isActive',
        type: SchemaType.BOOLEAN,
        required: true
      },
      {
        name: 'favicon',
        type: SchemaType.TEXT,
        required: false,
        options: { max: 500 }
      }
    ],
    indexes: [
      'CREATE INDEX idx_links_workspace ON links (workspace)',
      'CREATE INDEX idx_links_order ON links (`order`)',
      'CREATE INDEX idx_links_category ON links (category)'
    ],
    listRule: '@request.auth.id ?= workspace.owner || workspace.isPublic = true || @request.auth.id ?~ workspace.workspace_sharing_via_workspace.user',
    viewRule: '@request.auth.id ?= workspace.owner || workspace.isPublic = true || @request.auth.id ?~ workspace.workspace_sharing_via_workspace.user',
    createRule: '@request.auth.id ?= workspace.owner || (@request.auth.id ?~ workspace.workspace_sharing_via_workspace.user && workspace.workspace_sharing_via_workspace.permissions.canEdit = true)',
    updateRule: '@request.auth.id ?= workspace.owner || (@request.auth.id ?~ workspace.workspace_sharing_via_workspace.user && workspace.workspace_sharing_via_workspace.permissions.canEdit = true)',
    deleteRule: '@request.auth.id ?= workspace.owner || (@request.auth.id ?~ workspace.workspace_sharing_via_workspace.user && workspace.workspace_sharing_via_workspace.permissions.canDelete = true)'
  }