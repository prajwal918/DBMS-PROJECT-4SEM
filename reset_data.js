const { pool, sql } = require('./db_config');

async function resetBins() {
    try {
        console.log('Connecting...');
        await pool.connect();
        console.log('Connected.');

        // Reset existing bins to Pending
        console.log('Resetting existing bins...');
        await pool.request().query("UPDATE Bins SET status = 'Pending'");

        // Add new bins
        console.log('Adding new bins...');
        const newBins = [
            ['Central Park Gate', 'Central', 'Pending', 'Overflowing'],
            ['City Hall Plaza', 'Central', 'Pending', 'Normal'],
            ['Metro Station A', 'East', 'Pending', 'Overflowing'],
            ['University Campus', 'West', 'Pending', 'Normal'],
            ['Hospital Road', 'North', 'Pending', 'Normal']
        ];

        for (const bin of newBins) {
            await pool.request()
                .input('location', sql.VarChar, bin[0])
                .input('zone', sql.VarChar, bin[1])
                .input('status', sql.VarChar, bin[2])
                .input('level', sql.VarChar, bin[3])
                .query('INSERT INTO Bins (location, zone, status, level) VALUES (@location, @zone, @status, @level)');
        }

        // Add some waste log data for analytics
        console.log('Adding waste log data...');
        const wasteLogs = [
            ['Plastic', 45.5],
            ['Glass', 28.2],
            ['Metal', 15.8],
            ['Bio', 32.1],
            ['Plastic', 22.3],
            ['Glass', 18.5]
        ];

        for (const log of wasteLogs) {
            await pool.request()
                .input('type', sql.VarChar, log[0])
                .input('weight', sql.Decimal(10, 2), log[1])
                .query('INSERT INTO WasteLogs (waste_type, weight) VALUES (@type, @weight)');
        }

        console.log('Done! Bins reset and new data added.');
        await pool.close();
        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

resetBins();
