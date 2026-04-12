require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourPassword123!',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'ecotrack',
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // for local dev
    }
};

const pool = new sql.ConnectionPool(config);

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Connected to MSSQL via Tedious');
    } catch (err) {
        console.error('Database Connection Failed!', err);
    }
};

connectDB();

module.exports = { sql, pool };
