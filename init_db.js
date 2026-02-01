const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

// Wrap in object to match db_config.js success
const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=(local);Database=master;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

async function initDB() {
    try {
        console.log('Connecting to MSSQL server (master)...');
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('Connected to master.');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        const batches = schema.split('GO');

        for (const batch of batches) {
            const query = batch.trim();
            if (query) {
                try {
                    await pool.request().query(query);
                    console.log('Executed schema batch.');
                } catch (qErr) {
                    console.warn('Warning executing batch:', qErr.message);
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
