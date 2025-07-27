import { env } from "../config/environment";
import { pb } from "../config/database";
import { logger } from "../utils/logger";
import { UserSchema } from "../types/UserTypes";
import { WorkspaceSchema, WorkspaceShareColSchema } from "../types/WorkspaceType";
import { LinkSchema } from "../types/Link";
import { TaskCollectionSchema } from "../types/TaskTypes";
import { MonitorSessionSchema, SessionTaskSchema } from "../types/MonitoringTypes";
import { CollectionSchema, isSchemaRelationOptions, SchemaRelationOptions, SchemaType } from "../types/CollectionSchema";

const schemas: CollectionSchema[] = [
    UserSchema,
    WorkspaceSchema,
    WorkspaceShareColSchema,
    LinkSchema,
    TaskCollectionSchema,
    MonitorSessionSchema,
    SessionTaskSchema
]

async function setupPocketBase(): Promise<void> {
  try {
    logger.info('Starting PocketBase setup...');
    logger.info("Testing " + env.POCKETBASE_ADMIN_EMAIL + " pass: " + env.POCKETBASE_ADMIN_PASSWORD)
    
    // Authenticate as admin
    await pb.collection("_superusers").authWithPassword(env.POCKETBASE_ADMIN_EMAIL, env.POCKETBASE_ADMIN_PASSWORD);
    logger.info('Authenticated as admin');

    // Get existing collections
    const existingCollections = await pb.collections.getFullList();
    //logger.info(`Existing collections ${JSON.stringify(existingCollections)}`)
    const existingNames = existingCollections.map(c => c.name);

    for (const schema of schemas) {
      try {

        let test : SchemaRelationOptions[] = schema.fields.filter( isSchemaRelationOptions );
        test.forEach( function(f) {
          f.collectionId = existingCollections.find(c => c.name === f.collectionName)?.id;
        } );

        //console.log("Testing schema", test)

        if (existingNames.includes(schema.name)) {
          logger.info(`Updating collection: ${schema.name}`);

          const existing = existingCollections.find(c => c.name === schema.name);
          if (existing) {
            await pb.collections.update(existing.id, {
              fields: schema.fields,
              listRule: schema.listRule,
              viewRule: schema.viewRule,
              createRule: schema.createRule,
              updateRule: schema.updateRule,
              deleteRule: schema.deleteRule,
            });
          }
        } else {
          logger.info(`Creating collection: ${schema.name}`);
          
          

          const created = await pb.collections.create(schema);
          existingCollections.push(created);
        }

        logger.info(`✅ Collection ${schema.name} ready`);
      } catch (error) {
        logger.error(`Failed to setup collection ${schema.name}:`, error, schema);
        throw error;
      }
    }

    logger.info('🎉 PocketBase setup completed successfully!');
  } catch (error) {
    logger.error('PocketBase setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (import.meta.main) {
  setupPocketBase();
}