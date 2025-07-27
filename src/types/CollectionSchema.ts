export interface CollectionSchema {
  name: string;
  type: ColSchemaType | ColSchemaType.BASE;
  fields: Schema[];
  indexes?: string[];
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  updateRule?: string | null;
  deleteRule?: string | null;
  passwordAuth?: PassAuthConfig | null;
}

export enum ColSchemaType {
    AUTH = "auth",
    BASE = "base"
}

export interface Schema {
    type: SchemaType;
    name: string;
    required?: boolean | false;
    unique?: boolean;
}

export enum SchemaType {
    TEXT = "text",
    RELATION = "relation",
    JSON = "json",
    BOOLEAN = "bool",
    FILE = "file",
    URL = "url",
    NUMBER = "number",
    DATE = "date",
    SELECT = "select",
    AUTODATE = 'autodate'
}

export interface SchemaRelationOptions extends Schema {
    collectionId?: string;
    collectionName: string;
    cascadeDelete?: boolean;
    maxSelect: number;
}

export interface BasicSchemaOptions extends Schema {
    max?: number;
    min?: number;
}

export interface FileSchemaOptions extends Schema {
    maxSelect: number;
    maxSize: number;
}

export interface SelectSchemaOptions extends Schema {
    values: string[];
}

export interface AutoDateSchemaOptions extends Schema {
    onCreate?: boolean;
    onUpdate?: boolean;
}

export interface PassAuthConfig {
    enabled: boolean,
    identifyFields: string[];
}

export type SchemaStruct = SchemaRelationOptions | 
                     BasicSchemaOptions | 
                     SelectSchemaOptions | 
                     FileSchemaOptions;

export function isSchemaRelationOptions(schema: Schema): schema is SchemaRelationOptions {
    return schema.type === SchemaType.RELATION;
}