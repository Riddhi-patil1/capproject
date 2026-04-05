const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'justiceos.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Database connected to SQLite');
        
        db.serialize(() => {
            // Updated Cases table
            db.run(`CREATE TABLE IF NOT EXISTS Cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT UNIQUE,
                filing_date TEXT,
                case_type TEXT,
                life_risk BOOLEAN DEFAULT 0,
                senior_child BOOLEAN DEFAULT 0,
                deadline BOOLEAN DEFAULT 0,
                medical_emergency BOOLEAN DEFAULT 0,
                special_condition_score REAL DEFAULT 0,
                urgency_score REAL DEFAULT 0,
                waiting_time_score REAL DEFAULT 0,
                aging_points REAL DEFAULT 0,
                hearings_done INTEGER DEFAULT 0,
                status TEXT DEFAULT 'Pending',
                urgency INTEGER DEFAULT 0,
                priority REAL DEFAULT 0,
                judge_id INTEGER,
                slot INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Updated Judges table
            db.run(`CREATE TABLE IF NOT EXISTS Judges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                specialization TEXT DEFAULT 'General',
                status TEXT DEFAULT 'Active',
                workload INTEGER DEFAULT 0
            )`, () => {
                db.get("SELECT COUNT(*) as count FROM Judges", (err, row) => {
                    if (row && row.count === 0) {
                        const inserts = [
                            ['Judge Sharma', 'Criminal'],
                            ['Judge Rao', 'Civil'],
                            ['Judge Gupta', 'Family'],
                            ['Judge Verma', 'Property'],
                            ['Judge Singh', 'General']
                        ];
                        const insert = 'INSERT INTO Judges (name, specialization, workload) VALUES (?,?,?)';
                        inserts.forEach(j => db.run(insert, [j[0], j[1], 0]));
                    }
                });
            });

            // Schedule History
            db.run(`CREATE TABLE IF NOT EXISTS ScheduleHistory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                total_cases INTEGER,
                active_judges INTEGER,
                execution_time REAL,
                total_ops INTEGER,
                imbalance_value INTEGER,
                assignments JSON
            )`);

            // Interruption History
            db.run(`CREATE TABLE IF NOT EXISTS InterruptionHistory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                judge_name TEXT,
                cases_reassigned INTEGER,
                prev_workload INTEGER,
                new_workload INTEGER
            )`);

            // Notifications
            db.run(`CREATE TABLE IF NOT EXISTS Notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT,
                type TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_read BOOLEAN DEFAULT 0
            )`);
        });
    }
});

module.exports = db;
