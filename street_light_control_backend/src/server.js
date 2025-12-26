import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { setupConfigure } from './configure.js';
import { setupStatus } from './status.js';
import { setupFrontend } from './frontend.js';
import { setupFrontendOverallSummary } from './frontend_overallsummary.js';
import { setupFrontendCCMS } from './frontend_ccms.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 9001;
const HOST = process.env.HOST || '127.0.0.1';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'street_light_control',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  connectionLimit: 10,
  waitForConnections: true,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// device configuration and management routes
// Setup configure route
setupConfigure(app, pool);

// Setup status route
setupStatus(app, pool);

// Setup overall summary route
setupFrontendOverallSummary(app, pool);

// Setup CCMS detailed latest status route
setupFrontendCCMS(app, pool);

// Test database connection before starting server
pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully');
    conn.release();
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
    
    // Keep process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, closing server...');
      server.close(() => process.exit(0));
    });
    process.on('SIGINT', () => {
      console.log('SIGINT received, closing server...');
      server.close(() => process.exit(0));
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
