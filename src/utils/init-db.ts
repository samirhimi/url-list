import { readFile } from 'fs/promises';
import { join } from 'path';
import { query } from './db';

async function initializeDatabase() {
  try {
    const schemaPath = join(process.cwd(), 'src', 'db', 'schema.sql');
    const schema = await readFile(schemaPath, 'utf-8');
    
    await query(schema);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    process.exit(1);
  }
}

initializeDatabase();