const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { pool, sql } = require('./db_config');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Request Logger
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        console.log(`${req.method} ${req.url}`, req.body);
    }
    next();
});

// Async handler
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ==========================================
// API Endpoints
// ==========================================

// Login
app.post('/api/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.request()
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, password)
        .query('SELECT * FROM Users WHERE username = @username AND password = @password');

    if (result.recordset.length > 0) {
        res.json({ success: true, user: result.recordset[0] });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
}));

// Citizen: Submit Request
app.post('/api/requests', asyncHandler(async (req, res) => {
    const { userId, type, details } = req.body;

    await pool.request()
        .input('userId', sql.Int, userId)
        .input('type', sql.VarChar, type)
        .input('details', sql.VarChar, details)
        .query('INSERT INTO Requests (user_id, type, details) VALUES (@userId, @type, @details)');

    await pool.request()
        .input('userId', sql.Int, userId)
        .query('UPDATE Users SET green_points = green_points + 10 WHERE id = @userId');

    res.json({ success: true, message: 'Request submitted!' });
}));

// Citizen: Get Points
app.get('/api/users/:id', asyncHandler(async (req, res) => {
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('SELECT green_points FROM Users WHERE id = @id');
    res.json(result.recordset[0] || { green_points: 0 });
}));

// Driver: Get Bins
app.get('/api/bins', asyncHandler(async (req, res) => {
    const result = await pool.request().query('SELECT * FROM Bins ORDER BY CASE WHEN level = \'Overflowing\' THEN 1 ELSE 2 END, id');
    res.json(result.recordset);
}));

// Driver: Collect Bin
app.post('/api/bins/:id/collect', asyncHandler(async (req, res) => {
    await pool.request()
        .input('id', sql.Int, req.params.id)
        .query("UPDATE Bins SET status = 'Collected', level = 'Normal', last_collected = GETDATE() WHERE id = @id");
    res.json({ success: true });
}));

// Staff: Log Waste
app.post('/api/waste', asyncHandler(async (req, res) => {
    const { type, weight } = req.body;
    await pool.request()
        .input('type', sql.VarChar, type)
        .input('weight', sql.Decimal(10, 2), weight)
        .query('INSERT INTO WasteLogs (waste_type, weight) VALUES (@type, @weight)');
    res.json({ success: true });
}));

// Analytics: Efficiency
app.get('/api/analytics/efficiency', asyncHandler(async (req, res) => {
    const result = await pool.request()
        .query('SELECT waste_type, SUM(weight) as total_weight FROM WasteLogs GROUP BY waste_type');
    res.json(result.recordset);
}));

// Analytics: Leaderboard
app.get('/api/analytics/leaderboard', asyncHandler(async (req, res) => {
    const result = await pool.request()
        .query('SELECT TOP 10 username, green_points FROM Users WHERE role = \'citizen\' ORDER BY green_points DESC');
    res.json(result.recordset);
}));

// Analytics: Trends
app.get('/api/analytics/trends', (req, res) => {
    const mockTrends = [
        { month: 'Aug', count: 12 },
        { month: 'Sep', count: 19 },
        { month: 'Oct', count: 25 },
        { month: 'Nov', count: 32 },
        { month: 'Dec', count: 45 },
        { month: 'Jan', count: 50 },
    ];
    res.json(mockTrends);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
