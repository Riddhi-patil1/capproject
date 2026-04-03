const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'justiceos.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Database connected to SQLite');
        
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS Cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT UNIQUE,
                filing_date TEXT,
                case_type TEXT,
                life_risk BOOLEAN,
                senior_child BOOLEAN,
                deadline BOOLEAN,
                hearings_done INTEGER DEFAULT 0,
                urgency INTEGER DEFAULT 0,
                priority REAL,
                judge_id INTEGER,
                slot INTEGER
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Judges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                workload INTEGER DEFAULT 0
            )`, () => {
                db.get("SELECT COUNT(*) as count FROM Judges", (err, row) => {
                    if (row && row.count === 0) {
                        const insert = 'INSERT INTO Judges (name, workload) VALUES (?,?)';
                        for (let i = 1; i <= 5; i++) {
                            db.run(insert, [`Judge ${i}`, 0]);
                        }
                    }
                });
            });
        });
    }
});

module.exports = db;
