import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool instead of a single connection
// Use lazy initialization so the app doesn't crash on startup if DB is not configured
let pool = null;

export const getDb = async () => {
  if (!pool) {
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      console.warn('Database credentials not found. Using mock data mode.');
      return null;
    }
    
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'boutique_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('MySQL Connection Pool created successfully');
    } catch (error) {
      console.error('Error creating MySQL connection pool:', error);
      return null;
    }
  }
  return pool;
};
