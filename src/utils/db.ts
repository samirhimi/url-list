import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    console.log('Executing query:', { text, params });
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      console.log('Database connected successfully');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
};

testConnection();