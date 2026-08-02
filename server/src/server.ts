import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { teamService } from './services/team.service';

// ── Graceful crash handlers ──
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection', reason);
  // In production, let the process manager (PM2/Docker) restart
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.success(`
  ╔══════════════════════════════════════════╗
  ║   DSC GIETU Server Running              ║
  ║   Port: ${PORT}                            ║
  ║   Mode: ${env.NODE_ENV.padEnd(30)}║
  ║   URL: http://localhost:${PORT}            ║
  ╚══════════════════════════════════════════╝
  `);

  // Bulk auto-link team members on startup (idempotent, non-blocking)
  teamService.linkAllMembers().catch((err) => {
    logger.warn('Startup bulk-link failed', err);
  });
});

