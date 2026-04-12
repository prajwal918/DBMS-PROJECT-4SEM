# 🌍 EcoTrack: Smart City Waste Management System
> **Contributor Note:** Hey! I've put this guide together to help you navigate the project. We've modernized the backend to run on any OS (Linux/Mac/Windows) and simplified the setup.

---

## 1. 💡 What is EcoTrack?
EcoTrack is a **Smart City** solution designed to solve the "messy" problem of urban waste. Instead of just picking up trash on a fixed schedule, it uses data to make the process intelligent.

### The Core Idea:
- **Citizens** get rewarded (Green Points) for reporting issues.
- **Drivers** get optimized routes to pick up only the bins that actually need emptying.
- **Admins** see a high-level view of how much waste the city is producing and which zones are most efficient.

---

## 2. 🏗️ How it Works (The "Architecture")

The project is split into three main layers:

### A. The "Face" (Frontend)
Located in the `public/` folder. It’s pure HTML, CSS, and JavaScript.
- **`index.html`**: The gateway.
- **`citizen.html`**: Where users report overflowing bins.
- **`driver.html`**: The "Work Order" list for truck drivers.
- **`admin.html`**: The "War Room" with charts and leaderboards.

### B. The "Brain" (Backend)
- **`server.js`**: This is the heart of the app. It listens for requests (like "I just emptied a bin") and talks to the database.
- **`db_config.js`**: The bridge between Node.js and SQL Server. (We updated this to use `tedious` so it's super portable!)

### C. The "Memory" (Database)
- **`schema.sql`**: This defines the tables (Users, Bins, Requests, WasteLogs).
- **`init_db.js`**: A script I modified for you that automatically builds the entire database structure so you don't have to write manual SQL queries to start.

---

## 3. 🚦 The "User Flow"
How does a piece of data travel through the system?

1. **The Trigger:** A citizen sees an overflowing bin and clicks "Report" on the app.
2. **The API:** The frontend sends a `POST` request to `/api/requests`.
3. **The Database:** The server saves the request and **automatically awards 10 Green Points** to that user's profile.
4. **The Action:** A Driver logs in, sees the bin status has changed to "Overflowing," and goes to collect it.
5. **The Analytics:** Once collected, the weight is logged, and the Admin sees the "Total Waste Collected" chart update in real-time.

---

## 4. 🛠️ Tech Stack Recap
- **Language:** JavaScript (Node.js)
- **Web Framework:** Express.js
- **Database:** Microsoft SQL Server (MSSQL)
- **Styling:** Premium Dark Theme CSS
- **Visualization:** Chart.js (for the Admin dashboard)

---

## 5. 🛠️ Feature & Tool Mapping (The "What" and "How")

Here is exactly how we built each feature and the tools that power them:

| Feature | Description | Tool / Library Used |
| :--- | :--- | :--- |
| **User Roles** | Separate logins for Citizens, Drivers, and Admins. | **Express Middleware** + SQL `WHERE` clauses. |
| **Database Connection** | Connecting the Node server to the SQL Database safely. | **mssql (Tedious)** - We swapped this for universal OS compatibility. |
| **Point System** | Citizens earn "Green Points" for reporting waste. | **SQL Stored Procedures** (sp_AddRequest) for data integrity. |
| **Analytics Charts** | Visual bar/line charts showing waste production. | **Chart.js** - A powerful JS library for rendering data. |
| **Smart Bin Status** | Bins change status from "Normal" to "Overflowing". | **SQL Triggers** that update status based on log inputs. |
| **API Endpoints** | Sending/receiving data between front and back end. | **Express.js** routes (`GET`, `POST`). |
| **Security Configuration** | Hiding database passwords and port numbers. | **dotenv** - Keeps sensitive info out of the source code. |
| **UI Design** | A premium dark-themed interface. | **CSS3 (Flexbox/Grid)** + Modern UI principles. |
| **Cross-Origin Setup** | Allowing the frontend to talk to the backend smoothly. | **CORS** middleware. |

---

## 🚀 How to Run the Project (Step-by-Step)

### Step 1: Start the SQL Server (via Docker)
Since we are on Linux, the easiest way to run Microsoft SQL Server is using Docker:
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123!" \
   -p 1433:1433 --name sql_server -d \
   mcr.microsoft.com/mssql/server:2022-latest
```

### Step 2: Configure Environment
Copy the example environment file and ensure the password matches Step 1:
```bash
cp .env.example .env
```

### Step 3: Initialize & Start
1. **Initialize Database:** (Creates tables and seeds initial data)
   ```bash
   node init_db.js
   ```
2. **Start Server:**
   ```bash
   node server.js
   ```

### 🔐 Demo Credentials
| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin1` | `admin123` |
| **Citizen** | `citizen1` | `pass123` |
| **Driver** | `driver1` | `pass123` |

---

## 📄 Exporting to Professional PDF (via LaTeX)

For a high-quality project report, you can convert this Markdown to PDF using **Pandoc** with a LaTeX engine.

### Method 1: Command Line (Pandoc)
If you have Pandoc and TexLive installed:
```bash
pandoc PROJECT_GUIDE.md -o PROJECT_REPORT.pdf --pdf-engine=xelatex
```

### Method 2: Online (Overleaf/Pandoc Online)
1. Copy the content of this `.md` file.
2. Go to [Pandoc Online](https://pandoc.org/try/) or use an online Markdown-to-PDF converter that supports LaTeX.
3. Choose "PDF" as the output format.

### Method 3: VS Code (Markdown PDF)
1. Install the **Markdown PDF** extension.
2. Press `Ctrl+Shift+P` and type `Markdown PDF: Export (pdf)`.
3. It uses a headless browser to render a clean, professional PDF.

