const { pool, sql } = require('./db_config');

async function debugDB() {
    try {
        console.log('Connecting...');
        await pool.connect();
        console.log('Connected.');

        // 1. Check Users
        console.log('Checking Users table...');
        const users = await pool.request().query('SELECT * FROM Users');
        console.table(users.recordset);

        if (users.recordset.length === 0) {
            console.error('CRITICAL: No users found! Seed data missing.');
        } else {
            console.log('Users found.');
        }

        // 2. Try Insert (Simulate API call)
        console.log('Attempting to insert a request for UserID 1...');
        const userId = 1;
        const type = 'Special Pickup';
        const details = 'Debug Test';

        await pool.request()
            .input('userId', sql.Int, userId)
            .input('type', sql.VarChar, type)
            .input('details', sql.VarChar, details)
            .query('INSERT INTO Requests (user_id, type, details) VALUES (@userId, @type, @details)');

        console.log('Insert Successful!');

    } catch (err) {
        console.error('DEBUG ERROR:', err);
    } finally {
        pool.close();
    }
}

debugDB();
