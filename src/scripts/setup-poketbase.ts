import { env } from "../config/environment";
import { pb } from "../config/database";
import { logger } from "../utils/logger";
import { UserSchema } from "../types/UserTypes";
import { WorkspaceSchema, WorkspaceShareColSchema } from "../types/WorkspaceType";
import { LinkSchema } from "../types/Link";
import { TaskCollectionSchema } from "../types/TaskTypes";
import { MonitorSessionSchema, SessionTaskSchema } from "../types/MonitoringTypes";

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

    // Authenticate as admin
    await pb.admins.authWithPassword(env.POCKETBASE_ADMIN_EMAIL, env.POCKETBASE_ADMIN_PASSWORD);
    logger.info('Authenticated as admin');

    // Get existing collections
    const existingCollections = await pb.collections.getFullList();
    const existingNames = existingCollections.map(c => c.name);

    for (const schema of schemas) {
      try {
        if (existingNames.includes(schema.name)) {
          logger.info(`Updating collection: ${schema.name}`);
          
          const existing = existingCollections.find(c => c.name === schema.name);
          if (existing) {
            await pb.collections.update(existing.id, {
              schema: schema.schema,
              listRule: schema.listRule,
              viewRule: schema.viewRule,
              createRule: schema.createRule,
              updateRule: schema.updateRule,
              deleteRule: schema.deleteRule,
            });
          }
        } else {
          logger.info(`Creating collection: ${schema.name}`);
          
          await pb.collections.create({
            name: schema.name,
            type: schema.type,
            schema: schema.schema,
            listRule: schema.listRule,
            viewRule: schema.viewRule,
            createRule: schema.createRule,
            updateRule: schema.updateRule,
            deleteRule: schema.deleteRule,
          });
        }

        logger.info(`✅ Collection ${schema.name} ready`);
      } catch (error) {
        logger.error(`Failed to setup collection ${schema.name}:`, error);
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