const sql = require('mssql/msnodesqlv8');

const config = {
    // Using Driver 18 as found on the system
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=(local);Database=ecotrack;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

const pool = new sql.ConnectionPool(config);

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Connected to MSSQL structure via Windows Authentication');
    } catch (err) {
        console.error('Database Connection Failed!', err);
    }
};

connectDB();

module.exports = { sql, pool };
