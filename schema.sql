IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ecotrack')
BEGIN
    CREATE DATABASE ecotrack;
END
GO

USE ecotrack;
GO

IF OBJECT_ID('dbo.Requests', 'U') IS NOT NULL DROP TABLE dbo.Requests;
IF OBJECT_ID('dbo.Routes', 'U') IS NOT NULL DROP TABLE dbo.Routes;
IF OBJECT_ID('dbo.WasteLogs', 'U') IS NOT NULL DROP TABLE dbo.WasteLogs;
IF OBJECT_ID('dbo.Bins', 'U') IS NOT NULL DROP TABLE dbo.Bins;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'driver', 'admin')),
    green_points INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Bins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Collected')),
    level VARCHAR(50) DEFAULT 'Normal' CHECK (level IN ('Normal', 'Overflowing')),
    last_collected DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Requests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Special Pickup', 'Overflowing Bin')),
    details VARCHAR(MAX),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    created_at DATETIME DEFAULT GETDATE(),
    resolved_at DATETIME NULL,
    CONSTRAINT FK_Requests_Users FOREIGN KEY (user_id) REFERENCES Users(id)
);
GO

CREATE TABLE Routes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    driver_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    bin_ids VARCHAR(MAX),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed')),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Routes_Users FOREIGN KEY (driver_id) REFERENCES Users(id)
);
GO

CREATE TABLE WasteLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    center_id INT DEFAULT 1,
    waste_type VARCHAR(50) NOT NULL CHECK (waste_type IN ('Plastic', 'Glass', 'Metal', 'Bio')),
    weight DECIMAL(10, 2) NOT NULL,
    logged_at DATETIME DEFAULT GETDATE(),
    logged_by INT NULL,
    CONSTRAINT FK_WasteLogs_Users FOREIGN KEY (logged_by) REFERENCES Users(id)
);
GO

CREATE INDEX IX_Bins_Status ON Bins(status);
CREATE INDEX IX_Bins_Zone ON Bins(zone);
CREATE INDEX IX_Requests_UserId ON Requests(user_id);
CREATE INDEX IX_Requests_Status ON Requests(status);
CREATE INDEX IX_WasteLogs_Type ON WasteLogs(waste_type);
CREATE INDEX IX_WasteLogs_Date ON WasteLogs(logged_at);
GO

CREATE OR ALTER VIEW vw_CitizenLeaderboard AS
SELECT 
    id,
    username,
    green_points,
    DENSE_RANK() OVER (ORDER BY green_points DESC) AS rank
FROM Users
WHERE role = 'citizen';
GO

CREATE OR ALTER VIEW vw_WasteAnalytics AS
SELECT 
    waste_type,
    SUM(weight) AS total_weight,
    COUNT(*) AS total_entries,
    AVG(weight) AS avg_weight,
    MAX(logged_at) AS last_entry
FROM WasteLogs
GROUP BY waste_type;
GO

CREATE OR ALTER VIEW vw_BinStatusSummary AS
SELECT 
    zone,
    COUNT(*) AS total_bins,
    SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) AS collected,
    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN level = 'Overflowing' THEN 1 ELSE 0 END) AS overflowing
FROM Bins
GROUP BY zone;
GO

CREATE OR ALTER PROCEDURE sp_AddRequest
    @userId INT,
    @type VARCHAR(50),
    @details VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Requests (user_id, type, details) VALUES (@userId, @type, @details);
    UPDATE Users SET green_points = green_points + 10 WHERE id = @userId;
    SELECT 'Request submitted successfully' AS message;
END
GO

CREATE OR ALTER PROCEDURE sp_CollectBin
    @binId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Bins SET status = 'Collected', level = 'Normal', last_collected = GETDATE() WHERE id = @binId;
    SELECT 'Bin collected successfully' AS message;
END
GO

CREATE OR ALTER PROCEDURE sp_GetZoneEfficiency
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        zone,
        COUNT(*) AS total_bins,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) AS collected,
        CAST(SUM(CASE WHEN status = 'Collected' THEN 1.0 ELSE 0 END) / COUNT(*) * 100 AS DECIMAL(5,2)) AS efficiency_percent
    FROM Bins
    GROUP BY zone
    ORDER BY efficiency_percent DESC;
END
GO

CREATE OR ALTER TRIGGER trg_UpdateRequestStatus
ON Requests
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Requests
    SET status = 'Resolved'
    FROM Requests r
    INNER JOIN inserted i ON r.id = i.id
    WHERE i.resolved_at IS NOT NULL AND r.status != 'Resolved';
END
GO

INSERT INTO Users (username, password, role, green_points) VALUES 
('citizen1', 'pass123', 'citizen', 50),
('citizen2', 'pass123', 'citizen', 30),
('citizen3', 'pass123', 'citizen', 80),
('driver1', 'pass123', 'driver', 0),
('driver2', 'pass123', 'driver', 0),
('admin1', 'admin123', 'admin', 0);

INSERT INTO Bins (location, zone, status, level) VALUES
('Park Avenue 1', 'North', 'Pending', 'Normal'),
('Main Street 5', 'South', 'Pending', 'Overflowing'),
('School Lane 3', 'North', 'Collected', 'Normal'),
('City Hall Plaza', 'Central', 'Pending', 'Normal'),
('Metro Station A', 'East', 'Pending', 'Overflowing'),
('Hospital Road', 'West', 'Collected', 'Normal'),
('University Campus', 'East', 'Pending', 'Normal'),
('Shopping Mall', 'Central', 'Pending', 'Normal');

INSERT INTO WasteLogs (waste_type, weight) VALUES
('Plastic', 45.5),
('Glass', 28.2),
('Metal', 15.8),
('Bio', 32.1),
('Plastic', 52.3),
('Glass', 18.5),
('Metal', 22.7),
('Bio', 41.0);

INSERT INTO Requests (user_id, type, details, status) VALUES
(1, 'Special Pickup', 'E-Waste: Old laptop and printer', 'Resolved'),
(2, 'Overflowing Bin', 'Location: Near park entrance', 'Pending'),
(3, 'Special Pickup', 'Bulky: Old sofa', 'In Progress');
GO

PRINT 'EcoTrack Database Setup Complete!';
GO
