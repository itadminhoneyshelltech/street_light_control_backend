import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Honeyshell2024',
  database: process.env.DB_NAME || 'street_light_control',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ MySQL connected successfully');
    connection.release();
  } catch (error) {
    console.error('✗ MySQL connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await pool.end();
    console.log('✓ MySQL disconnected');
  } catch (error) {
    console.error('✗ MySQL disconnection error:', error);
  }
};

export { pool };
