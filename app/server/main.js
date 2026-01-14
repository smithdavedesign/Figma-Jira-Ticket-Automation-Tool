import { Server } from '../server.js';
import { Logger } from '../../core/utils/logger.js';

// Determine if this is the main module running
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

async function main() {
  const logger = new Logger('Main');
  
  try {
    logger.info('🎯 Phase 8: Server Architecture Refactoring (Proxy)');
    logger.info('Redirecting legacy path app/server/main.js -> app/server.js');
    
    // Instantiate and start the server from the parent directory
    const server = new Server();
    await server.start();
    
    // Keep process alive
    process.on('SIGTERM', () => server.shutdown());
    process.on('SIGINT', () => server.shutdown());
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (isMainModule) {
  main().catch(console.error);
}

export { main };
