import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbFile = path.join(__dirname, '../../restaurant.db');

// Open database connection
async function openDb() {
  return open({
    filename: dbFile,
    driver: sqlite3.Database
  });
}

// Export database connection
export default openDb;