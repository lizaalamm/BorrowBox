import 'dotenv/config';
import app from './app.js';
import storage, { DEMO_ACCOUNTS } from './config/storage.js';

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  console.error('[server] JWT_SECRET must be set to at least 32 characters when NODE_ENV=production.');
  process.exit(1);
}

// Wait for the seed to finish (first run only) before accepting traffic.
await storage.ready;

const server = app.listen(PORT, HOST, () => {
  const lines = [
    '',
    '  BorrowBox API is running',
    '  ------------------------------------------',
    `  Environment : ${NODE_ENV}`,
    `  Listening   : http://${HOST}:${PORT}`,
    `  Docs        : http://localhost:${PORT}/api-docs`,
    `  Health      : http://localhost:${PORT}/api/health`,
    '  ------------------------------------------',
    `  Users       : ${storage.data.users.length}`,
    `  Items       : ${storage.data.items.length}`,
    `  Categories  : ${storage.data.categories.length}`,
    `  Requests    : ${storage.data.borrowRequests.length}`,
    '  ------------------------------------------',
    '  Demo accounts (development seed):',
    ...DEMO_ACCOUNTS.map((account) => `    ${account.role.padEnd(5)} ${account.email} / ${account.password}`),
    '',
  ];
  console.log(lines.join('\n'));
});

const shutdown = (signal) => {
  console.log(`\n[server] Received ${signal}, shutting down gracefully.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason);
});
