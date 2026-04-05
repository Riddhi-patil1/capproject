const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const { performance } = require('perf_hooks');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Helper Functions ---

const calculatePriorityBreakdown = (caseData) => {
    if (!caseData) return { urgency_score: 0, waiting_time_score: 0, special_condition_score: 0, aging_points: 0, final_priority: 0 };
    
    // 1. Urgency Score (0.5 weight)
    const baseValues = { 'Criminal': 10, 'Family': 7, 'Civil': 4, 'Property': 3 };
    let baseUrgency = baseValues[caseData.case_type] || 0;
    
    let modifiers = 0;
    if (caseData.life_risk) modifiers += 5;
    if (caseData.senior_child) modifiers += 3;
    if (caseData.deadline) modifiers += 4;
    if (caseData.medical_emergency) modifiers += 8;
    
    const urgency_score = baseUrgency + modifiers;

    // 2. Waiting Time Score (0.3 weight)
    const filingDate = new Date(caseData.filing_date);
    const currentDate = new Date();
    let daysWaiting = 0;
    if (!isNaN(filingDate.getTime())) {
        daysWaiting = Math.max(0, Math.floor((currentDate - filingDate) / (1000 * 60 * 60 * 24)));
    }
    const waiting_time_score = Math.min(100, daysWaiting * 0.5); // Cap for score normalization

    // 3. Special Condition Score (0.2 weight) (Handled as a specific value provided or calculated)
    const special_condition_score = caseData.special_condition_score || 0;

    // Aging Points: +2 for every 7 days
    const aging_points = Math.floor(daysWaiting / 7) * 2;

    // Final Weighted Priority
    const final_priority = (0.5 * urgency_score) + (0.3 * waiting_time_score) + (0.2 * special_condition_score) + aging_points;

    return {
        urgency_score,
        waiting_time_score,
        special_condition_score,
        aging_points,
        final_priority
    };
};

const addNotification = (message, type) => {
    db.run(`INSERT INTO Notifications (message, type) VALUES (?, ?)`, [message, type]);
};

// --- API Endpoints ---

app.post('/add-case', (req, res) => {
    const data = req.body;
    const breakdown = calculatePriorityBreakdown(data);
    
    const query = `INSERT INTO Cases (
        case_id, filing_date, case_type, life_risk, senior_child, deadline, medical_emergency, 
        special_condition_score, urgency_score, waiting_time_score, aging_points, priority, hearings_done
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        data.case_id, data.filing_date, data.case_type, 
        data.life_risk ? 1 : 0, data.senior_child ? 1 : 0, data.deadline ? 1 : 0, data.medical_emergency ? 1 : 0,
        breakdown.special_condition_score, breakdown.urgency_score, breakdown.waiting_time_score, 
        breakdown.aging_points, breakdown.final_priority, data.hearings_done || 0
    ];

    db.run(query, params, function(err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ error: `Unique Case ID Error: Case with ID #${data.case_id} already exists.` });
            }
            return res.status(500).json({ error: err.message });
        }
        addNotification(`Case #${data.case_id} added successfully.`, 'Success');
        res.json({ message: "Case added", id: this.lastID, priority: breakdown.final_priority });
    });
});

app.get('/cases', (req, res) => {
    db.all(`SELECT * FROM Cases ORDER BY priority DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/judges', (req, res) => {
    db.all(`SELECT * FROM Judges ORDER BY id ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/generate-schedule', (req, res) => {
    const startTime = performance.now();
    let totalOps = 0;
    let comparisons = 0;
    let assignmentsCount = 0;

    // 1. Get all active judges
    db.all(`SELECT * FROM Judges WHERE status = 'Active'`, [], (err, judges) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. Get all pending cases
        db.all(`SELECT * FROM Cases WHERE status = 'Pending'`, [], (err, cases) => {
            if (err) return res.status(500).json({ error: err.message });

            // Recalculate Aging and Priority for all pending cases
            cases.forEach(c => {
                const breakdown = calculatePriorityBreakdown(c);
                c.priority = breakdown.final_priority;
                c.urgency_score = breakdown.urgency_score;
                c.waiting_time_score = breakdown.waiting_time_score;
                c.aging_points = breakdown.aging_points;
                totalOps++;
            });

            // Sort cases by Priority (Max Heap Logic simulation)
            cases.sort((a, b) => {
                comparisons++;
                return b.priority - a.priority;
            });

            // Reset judge workloads for this fresh run
            judges.forEach(j => { j.workload = 0; totalOps++; });

            let schedule = [];
            
            cases.forEach(c => {
                // Filter eligible judges (Specialization or General)
                let eligibleJudges = judges.filter(j => {
                    comparisons++;
                    return j.specialization === c.case_type || j.specialization === 'General';
                });

                if (eligibleJudges.length === 0) {
                    // If no match even for general, use all judges as fallback
                    eligibleJudges = judges;
                }

                if (eligibleJudges.length === 0) {
                    // No possible judges available at all
                    addNotification(`Case ${c.case_id} could not be assigned: No active judges.`, 'Error');
                    return;
                }

                // Min Heap logic: select judge with least workload
                eligibleJudges.sort((a, b) => {
                    comparisons++;
                    return a.workload - b.workload;
                });

                const selectedJudge = eligibleJudges[0];
                selectedJudge.workload++;
                assignmentsCount++;

                c.judge_id = selectedJudge.id;
                c.judge_name = selectedJudge.name;
                c.slot = selectedJudge.workload;
                c.reason = `Assigned to ${selectedJudge.name} because specialization matched ${selectedJudge.specialization === c.case_type ? c.case_type : 'General'}.`;
                
                schedule.push(c);
                addNotification(`Case ${c.case_id} assigned to ${selectedJudge.name}.`, 'Assignment');
            });

            // Calculate Load Imbalance
            const workloads = judges.map(j => j.workload);
            const maxL = workloads.length > 0 ? Math.max(...workloads) : 0;
            const minL = workloads.length > 0 ? Math.min(...workloads) : 0;
            const imbalance = maxL - minL;
            let statusLabel = "Poor Balance";
            if (imbalance <= 1) statusLabel = "Excellent Balance";
            else if (imbalance <= 3) statusLabel = "Good Balance";

            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(4);

            // Save to history
            const historyQuery = `INSERT INTO ScheduleHistory (total_cases, active_judges, execution_time, total_ops, imbalance_value, assignments) VALUES (?, ?, ?, ?, ?, ?)`;
            db.run(historyQuery, [cases.length, judges.length, executionTime, totalOps, imbalance, JSON.stringify(schedule)]);

            // Update database for all cases and judges
            db.serialize(() => {
                schedule.forEach(c => {
                    db.run(`UPDATE Cases SET judge_id = ?, slot = ?, status = 'Scheduled', priority = ?, aging_points = ? WHERE id = ?`, 
                           [c.judge_id, c.slot, c.priority, c.aging_points, c.id]);
                });
                judges.forEach(j => {
                    db.run(`UPDATE Judges SET workload = ? WHERE id = ?`, [j.workload, j.id]);
                });
            });

            res.json({
                schedule,
                judges,
                algoStats: {
                    time: executionTime,
                    totalOps,
                    comparisons,
                    assignments: assignmentsCount,
                    complexity: "O(N log N)",
                    imbalance,
                    imbalanceStatus: statusLabel,
                    maxLoad: maxL,
                    minLoad: minL,
                    avgLoad: (workloads.reduce((a, b) => a + b, 0) / (judges.length || 1)).toFixed(2)
                }
            });
        });
    });
});

app.post('/simulate-interrupt', (req, res) => {
    const { judge_id } = req.body;

    db.get(`SELECT * FROM Judges WHERE id = ?`, [judge_id], (err, judge) => {
        if (!judge) return res.status(404).json({ error: "Judge not found" });

        const prevWorkload = judge.workload;

        // 1. Mark judge as inactive
        db.run(`UPDATE Judges SET status = 'Inactive', workload = 0 WHERE id = ?`, [judge_id], () => {
            
            // 2. Find only Pending/Scheduled cases for this judge (not completed)
            db.all(`SELECT * FROM Cases WHERE judge_id = ? AND status = 'Scheduled'`, [judge_id], (err, casesToReassign) => {
                
                // Clear current judge assignment
                db.run(`UPDATE Cases SET judge_id = NULL, slot = NULL, status = 'Pending' WHERE judge_id = ? AND status = 'Scheduled'`, [judge_id], () => {
                    
                    const reassignedCount = casesToReassign.length;
                    addNotification(`Judge ${judge.name} unavailable. ${reassignedCount} cases redistributed.`, 'Warning');
                    
                    // Save to Interruption History
                    db.run(`INSERT INTO InterruptionHistory (judge_name, cases_reassigned, prev_workload, new_workload) VALUES (?, ?, ?, ?)`,
                           [judge.name, reassignedCount, prevWorkload, 0]);

                    res.json({ message: "Judge marked inactive. Pending cases returned to queue.", reassigned: reassignedCount });
                });
            });
        });
    });
});

app.get('/dashboard-stats', async (req, res) => {
    const query = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });

    const queryAll = (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });

    try {
        const [cS, jS, judgeWorkloads, pS, comS, caseTypes, dates] = await Promise.all([
            query('SELECT COUNT(*) as total_cases, AVG(priority) as avg_priority, MAX(priority) as high_priority FROM Cases'),
            query("SELECT COUNT(*) as total_judges FROM Judges WHERE status = 'Active'"),
            queryAll('SELECT name, workload FROM Judges'),
            query("SELECT COUNT(*) as pending FROM Cases WHERE status = 'Pending'"),
            query("SELECT COUNT(*) as completed FROM Cases WHERE hearings_done >= 10"),
            queryAll('SELECT case_type, COUNT(*) as count FROM Cases GROUP BY case_type'),
            queryAll('SELECT filing_date FROM Cases')
        ]);

        let totalDays = 0;
        const now = new Date();
        const datesArr = dates || [];
        datesArr.forEach(d => {
            totalDays += Math.max(0, Math.floor((now - new Date(d.filing_date)) / (1000 * 60 * 60 * 24)));
        });
        const avgWaiting = (totalDays / (datesArr.length || 1)).toFixed(1);

        const workloads = judgeWorkloads || [];
        const totalCases = cS?.total_cases || 0;
        const totalJudges = jS?.total_judges || 0;
        const totalWorkload = workloads.reduce((s, j) => s + (j.workload || 0), 0);
        
        // Utilization calculation based on total workload vs capacity (arbitrary capacity of 10)
        const utilization = (((totalWorkload) / ((totalJudges || 1) * 10 || 1)) * 100).toFixed(1) + "%";

        res.json({
            total_cases: totalCases,
            avg_priority: parseFloat(cS?.avg_priority || 0).toFixed(2),
            high_priority: parseFloat(cS?.high_priority || 0).toFixed(2),
            total_judges: totalJudges,
            workloads: workloads,
            caseTypes: caseTypes || [],
            pending: pS?.pending || 0,
            completed: comS?.completed || 0,
            avg_waiting: avgWaiting,
            utilization: utilization
        });
    } catch (err) {
        console.error("Database error in /dashboard-stats:", err);
        if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/history', (req, res) => {
    db.all(`SELECT * FROM ScheduleHistory ORDER BY timestamp DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/notifications', (req, res) => {
    db.all(`SELECT * FROM Notifications ORDER BY timestamp DESC LIMIT 20`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/delete-case', (req, res) => {
    const { id } = req.body;
    db.run(`DELETE FROM Cases WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted" });
    });
});

const path = require('path');
const PORT = process.env.PORT || 5000;
// Serve Static Files from the frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Safely handle SPA navigation for Express 5
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
