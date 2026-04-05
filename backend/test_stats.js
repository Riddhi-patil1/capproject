const db = require('./database.js');

const query = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const queryAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

async function runTests() {
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
        
        const utilization = (((totalWorkload) / ((totalJudges || 1) * 10 || 1)) * 100).toFixed(1) + "%";

        console.log(JSON.stringify({
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
        }, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Database error in test script:", err);
        process.exit(1);
    }
}

runTests();
