import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare const connectDB: () => Promise<void>;
export declare const disconnectDB: () => Promise<void>;
export { pool };
//# sourceMappingURL=database.d.ts.map