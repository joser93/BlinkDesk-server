interface CollectionSchema {
  name: string;
  type: ColSchemaType | ColSchemaType.BASE;
  schema: Schema[];
  indexes?: string[];
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  updateRule?: string | null;
  deleteRule?: string | null;
}

enum ColSchemaType {
    AUTH = "auth",
    BASE = "base"
}

interface Schema {
    type: SchemaType;
    name: string;
    required?: boolean | false;
    options?: SchemaOptions;
}

enum SchemaType {
    TEXT = "text",
    RELATION = "relation",
    JSON = "json",
    BOOLEAN = "bool",
    FILE = "file",
    URL = "url",
    NUMBER = "number",
    DATE = "date",
    SELECT = "select"
}

interface SchemaRelationOptions {
    collectionId: string;
    cascadeDelete?: boolean;
    maxSelect: number;
}

interface BasicSchemaOptions {
    max?: number;
    min?: number;
}

interface FileSchemaOptions {
    maxSelect: number;
    maxSize: number;
}

interface SelectSchemaOptions {
    values: string[];
}

type SchemaOptions = SchemaRelationOptions | 
                     BasicSchemaOptions | 
                     SelectSchemaOptions | 
                     FileSchemaOptions;