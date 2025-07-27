import { DatabaseConnection } from "./config/database";
import { env, isDevelopment } from "./config/environment";
import { createServer } from "./config/server";
import { logger } from "./utils/logger";

async function startServer(): Promise<void> {
  try {
    // Initialize database connection
    const db = DatabaseConnection.getInstance();
    await db.connect();
    logger.info('Database connection established');

    // Create Express server
    const app = createServer();

    // Start server
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`PocketBase URL: ${env.POCKETBASE_URL}`);
      
      if (isDevelopment) {
        logger.info('Development mode enabled');
        logger.info('API Documentation will be available at /api/docs');
      }
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await db.disconnect();
          logger.info('Database disconnected');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});