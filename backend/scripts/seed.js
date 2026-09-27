/**
 * Resets the JSON data store and re-runs the demo seed.
 *
 * Usage: npm run seed            (deletes the current database first)
 *        npm run seed -- --keep  (reseed only when the database is empty)
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/db.json');
const keepExisting = process.argv.includes('--keep');

if (!keepExisting && fs.existsSync(DB_PATH)) {
  fs.rmSync(DB_PATH);
  console.log(`[seed] Removed ${DB_PATH}`);
}

const { default: storage, DEMO_ACCOUNTS } = await import('../src/config/storage.js');
await storage.ready;

const count = (collection) => storage.find(collection, () => true).length;

console.log('[seed] Demo data ready');
console.log(`[seed]   users: ${count('users')}, items: ${count('items')}, categories: ${count('categories')}`);
console.log(`[seed]   requests: ${count('borrowRequests')}, reviews: ${count('reviews')}, notifications: ${count('notifications')}`);
console.log('[seed] Sign in with:');
for (const account of DEMO_ACCOUNTS) {
  console.log(`[seed]   ${account.role.padEnd(5)} ${account.email} / ${account.password}`);
}
