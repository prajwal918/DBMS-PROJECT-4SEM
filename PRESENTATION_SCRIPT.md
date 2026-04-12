# EcoTrack: Presentation Script & Role Division

This document outlines the exact flow of our DBMS project presentation. It is divided so that everyone presents a piece of the system, starting with the Lead Architect introducing the core technologies.

---

## 1. Project Intro & Tech Stack (Prajwal Jogi - Lead Architect)
**Role Focus:** Welcome the professor, explain the problem, and reveal the database technologies used before handing it off to the team for the demo.

### The Introduction
*   **The Problem:** "Hello everyone. For our DBMS project, we decided to tackle inefficient waste management. Currently, trucks drive fixed routes, missing overflowing bins and wasting fuel on empty ones."
*   **The Solution:** "We built **EcoTrack**, a Smart City database application that crowdsources data from Citizens to dynamically route Drivers, while giving Admins real-time analytics."
*   **The Database & Tech Stack:** "Before we show you the demo, here is the architecture we built:
    1.  **Frontend:** HTML/CSS/JS for the user interfaces.
    2.  **Backend Middleware:** We used **Node.js with Express** to securely connect the frontend to the database.
    3.  **The Database:** We used **Microsoft SQL Server (MSSQL)**. Because we wanted this to be portable, we containerized the SQL Server using **Docker**, meaning it runs perfectly across any operating system."
*   **The Handoff:** "I'll now pass it over to Satvik, who will show you how data enters our system through the Citizen Portal."

---

## 2. Team Member 1 (Satvik): The Citizen Portal
**Role Focus:** The Citizen (Data Generation) phase and Stored Procedures.

### Live Demo: Citizen Portal
*   **Action:** Open the Citizen Portal. *(Note: We removed the login using a password for this demo to show the data flow directly, but we will add it in the future).*
*   **Explanation:** "This is where the data enters our system. A citizen sees a full trash bin and submits a report."
*   **Action:** Submit a report for an "Overflowing Bin" at a fake location (e.g., "Main Library").
*   **The DBMS Logic:** "When I click submit, the frontend sends a JSON payload to our Node.js API. The server executes an SQL `INSERT` statement into the `Requests` table. More importantly, we wrote an SQL **Stored Procedure** that automatically executes an `UPDATE` statement on the `Users` table, instantly awarding the citizen 10 Green Points for their civic engagement. You can see the points update in real-time."
*   **The Handoff:** "Now, Aghanya will show you how this data dynamically affects the Driver's route."

---

## 3. Team Member 2 (Aghanya): The Driver Portal & Routing Logic
**Role Focus:** The operational phase, dynamic sorting, and data updating.

### Live Demo: Route Optimization & Task Completion
*   **Action:** Open the Driver Portal. *(Note: We removed the login using a password for this demo to show the data flow directly, but we will add it in the future).*
*   **Explanation:** "While the citizen creates the data, the driver acts on it. This is their digital work order."
*   **The DBMS Logic:** "Notice how the 'Main Library' bin Satvik just reported is at the very top of the list with a red 'Overflowing' badge. This isn't random. Our backend runs an SQL `SELECT` query with an `ORDER BY` clause prioritizing `level = 'Overflowing'`. The database does the heavy lifting to ensure emergency pickups are handled first."
*   **Action:** Click 'Collect' on the overflowing bin.
*   **Explanation:** "When the driver collects the bin, a `POST` request triggers an SQL `UPDATE` statement, changing the bin's status to 'Collected' and its level back to 'Normal'."
*   **Action:** Scroll to the Weigh Station Log. Enter `25.5` kg of Plastic and click submit.
*   **The DBMS Logic:** "At the end of the shift, the driver weighs the truck. Logging this data triggers an `INSERT` into our `WasteLogs` table, stamping it with the material type, the exact weight, and the `GETDATE()` timestamp."
*   **The Handoff:** "Finally, Prajwal will show you how all this data comes together in the Admin Dashboard."

---

## 4. Admin Dashboard & Conclusion (Prajwal Jogi - Lead Architect)
**Role Focus:** Data aggregation, analytics, and the final wrap-up.

### Live Demo: Admin Dashboard
*   **Action:** Open the Admin Dashboard. *(Note: We removed the login using a password for this demo to show the data flow directly, but we will add it in the future).*
*   **Explanation:** "This is where all the data converges. The City Manager uses this dashboard to monitor the entire ecosystem."
*   **The DBMS Logic:** 
    *   **The Chart:** "The Waste Analytics chart is powered by an SQL **Aggregate Query**. It runs a `SELECT waste_type, SUM(weight)` grouped by `waste_type` from the `WasteLogs` table. It instantly calculated the 25.5 kg of Plastic the driver just dropped off."
    *   **The Leaderboard:** "The Citizen Leaderboard uses an SQL **View** (`vw_CitizenLeaderboard`) and the `DENSE_RANK()` window function to accurately rank users based on their Green Points."

### The Conclusion
*   **Explanation:** "By using Node.js as our bridge and Docker for our MSSQL database, we created a highly secure and portable system."
*   **Conclusion:** "EcoTrack proves that a well-designed relational database isn't just for storing data; it can actively drive operational efficiency and citizen engagement in a Smart City. Thank you, and we are happy to take any questions!"