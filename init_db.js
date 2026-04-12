require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourPassword123!',
    server: process.env.DB_SERVER || 'localhost',
    database: 'master', // Start with master to create/use database
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function initDB() {
    try {
        console.log('Connecting to MSSQL server (master)...');
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('Connected to master.');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        
        // Remove GO statements as tedious doesn't support them directly
        // We split by GO and execute each batch
        const batches = schema.split(/^\s*GO\s*$/m);

        for (const batch of batches) {
            const query = batch.trim();
            if (query) {
                try {
                    await pool.request().query(query);
                    console.log('Executed schema batch.');
                } catch (qErr) {
                    // Ignore "Database 'ecotrack' already exists" error during initial setup if it happens
                    if (!qErr.message.includes('already exists')) {
                        console.warn('Warning executing batch:', qErr.message);
                    }
                }
            }
        }

        console.log('Database initialized successfully.');
        await pool.close();
        process.exit(0);

    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDB();
