import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Menggunakan Connection Pool untuk efisiensi koneksi ke Supabase
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Rekomendasi pengaturan pool untuk monolith
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

export const db = {
  // Wrapper untuk menjalankan parameterised query dengan aman
  query: (text, params) => pool.query(text, params),
  
  // Method khusus untuk database transaction (BEGIN, COMMIT, ROLLBACK)
  getClient: () => pool.connect()
};