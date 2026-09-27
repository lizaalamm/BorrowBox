import dotenv from 'dotenv';
import app from './app.js';
import storage from './config/storage.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  📦 BorrowBox API Server Running!
  ──────────────────────────────────
  🚀 Server: http://localhost:${PORT}
  📚 Swagger Docs: http://localhost:${PORT}/api-docs
  🏥 Health: http://localhost:${PORT}/api/health
  ──────────────────────────────────
  👤 Demo Accounts:
     Admin: admin@borrowbox.com / Admin@123
     User:  demo@borrowbox.com / Demo@123
  ──────────────────────────────────
  💾 Storage: In-memory + JSON persistence
     Users: ${storage.data.users.length}
     Items: ${storage.data.items.length}
     Categories: ${storage.data.categories.length}
  `);
});
