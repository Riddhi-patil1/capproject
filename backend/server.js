const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// AOA fixed logic
// AoA (Analysis of Algorithms) performance metrics are now calculated dynamically in the schedule endpoint.

const getBaseUrgency = (type) => {
    const values = { 'Criminal': 5, 'Family': 4, 'Civil': 2, 'Property': 2 };
    return values[type] || 0;
};

app.post('/add-case', (req, res) => {
    const { case_id, filing_date, case_type, life_risk, senior_child, deadline, hearings_done } = req.body;

    const baseUrg = getBaseUrgency(case_type);
    const lrVal = (life_risk === 'Yes' || life_risk === true) ? 1 : 0;
    const scVal = (senior_child === 'Yes' || senior_child === true) ? 1 : 0;
    const dlVal = (deadline === 'Yes' || deadline === true) ? 1 : 0;

    const urgency = baseUrg + (lrVal * 5) + (scVal * 3) + (dlVal * 4);

    const query = `INSERT INTO Cases (case_id, filing_date, case_type, life_risk, senior_child, deadline, hearings_done, urgency) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    console.log("Attempting to add case:", case_id);
    db.run(query, [case_id, filing_date, case_type, lrVal, scVal, dlVal, hearings_done || 0, urgency], function (err) {
        if (err) {
            console.error("DATABASE ERROR:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Case successfully added! ID:", this.lastID);
        res.json({ message: "Case added", id: this.lastID, urgency });
    });
});

app.get('/cases', (req, res) => {
    db.all(`SELECT * FROM Cases`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/judges', (req, res) => {
    db.all(`SELECT * FROM Judges WHERE id IS NOT NULL`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/calculate-priority', (req, res) => {
    // Recalculate priority for all cases not yet scheduled
    db.all(`SELECT * FROM Cases`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        let currentDate = new Date();
        // Just arbitrarily using current date. 
        // We will loop and update each.

        let updates = 0;
        let errors = [];

        if (rows.length === 0) return res.json({ message: "No cases to update" });

        rows.forEach(row => {
            const fd = new Date(row.filing_date);
            const caseAgeDays = Math.max(0, Math.floor((currentDate - fd) / (1000 * 60 * 60 * 24)));

            // Priority = (CaseAge × 3) + (Urgency × 2) - HearingsDone
            const priority = (caseAgeDays * 3) + (row.urgency * 2) - (row.hearings_done || 0);

            db.run(`UPDATE Cases SET priority = ? WHERE id = ?`, [priority, row.id], function (updateErr) {
                updates++;
                if (updateErr) errors.push(updateErr.message);

                if (updates === rows.length) {
                    res.json({ message: "Priorities updated", errors });
                }
            });
        });
    });
});

app.post('/generate-schedule', (req, res) => {
    const startTime = performance.now();
    // 1. Get all judges
    // 2. Get all cases ordered by priority DESC

    db.all(`SELECT * FROM Judges`, [], (err, judges) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(`SELECT * FROM Cases ORDER BY priority DESC`, [], (err, cases) => {
            if (err) return res.status(500).json({ error: err.message });

            // Reset workloads to 0
            judges.forEach(j => j.workload = 0);

            let assignedCases = [];
            
            // SORTING COMPLEXITY: O(N log N)
            // Assignment Loop: O(N * J) where J is number of judges
            
            const getNextJudge = () => {
                judges.sort((a, b) => a.workload - b.workload);
                return judges[0];
            };

            cases.forEach(c => {
                const j = getNextJudge();
                j.workload++;
                const slot = j.workload;
                c.judge_id = j.id;
                c.judge_name = j.name;
                c.slot = slot;
                assignedCases.push(c);
            });

            // Update db
            let updates = 0;
            judges.forEach(j => {
                db.run('UPDATE Judges SET workload = ? WHERE id = ?', [j.workload, j.id]);
            });

            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(4);

            if (cases.length === 0) {
                return res.json({ 
                    schedule: [], 
                    judges, 
                    algoStats: { time: executionTime, complexity: "O(N log N)", totalOps: judges.length + cases.length } 
                });
            }

            cases.forEach(c => {
                db.run('UPDATE Cases SET judge_id = ?, slot = ? WHERE id = ?', [c.judge_id, c.slot, c.id], () => {
                    updates++;
                    if (updates === cases.length) {
                        res.json({ 
                            schedule: assignedCases, 
                            judges,
                            algoStats: { 
                                time: executionTime, 
                                complexity: "O(N log N)", 
                                type: "Greedy Strategy",
                                totalOps: cases.length * judges.length
                            }
                        });
                    }
                });
            });
        });
    });
});

app.post('/delete-case', (req, res) => {
    const { id } = req.body;
    db.run(`DELETE FROM Cases WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Case deleted successfully" });
    });
});

app.post('/simulate-interrupt', (req, res) => {
    const { judge_id } = req.body; // Which judge is absent
    db.run(`DELETE FROM Judges WHERE id = ?`, [judge_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        // Automatically reschedule by unassigning all cases from this judge and redistributing
        // To simplify, we'll just clear all assignments, and frontend can call generate-schedule again,
        // or we just call the same logic as generate-schedule internally.
        res.json({ message: "Judge removed. Please regenerate schedule to redistribute." });
    });
});

app.get('/dashboard-stats', (req, res) => {
    db.get('SELECT COUNT(*) as total_cases, AVG(priority) as avg_priority FROM Cases', [], (err, caseStats) => {
        db.get('SELECT COUNT(*) as total_judges FROM Judges', [], (err, judgeStats) => {
            db.all('SELECT name, workload FROM Judges', [], (err, judgeWorkloads) => {
                db.all('SELECT case_type, COUNT(*) as count FROM Cases GROUP BY case_type', [], (err, caseTypes) => {
                    res.json({
                        total_cases: caseStats.total_cases || 0,
                        avg_priority: parseFloat(caseStats.avg_priority || 0).toFixed(2),
                        total_judges: judgeStats.total_judges || 0,
                        workloads: judgeWorkloads,
                        caseTypes
                    });
                });
            });
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
