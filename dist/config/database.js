"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.disconnectDB = exports.connectDB = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Honeyshell2024',
    database: process.env.DB_NAME || 'street_light_control',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.pool = pool;
const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✓ MySQL connected successfully');
        connection.release();
    }
    catch (error) {
        console.error('✗ MySQL connection error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await pool.end();
        console.log('✓ MySQL disconnected');
    }
    catch (error) {
        console.error('✗ MySQL disconnection error:', error);
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=database.js.map