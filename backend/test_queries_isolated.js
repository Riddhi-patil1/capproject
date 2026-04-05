const db = require('./database.js');

const queries = [
    { name: 'stats_cases', q: 'SELECT COUNT(*) as total_cases, AVG(priority) as avg_priority, MAX(priority) as high_priority FROM Cases' },
    { name: 'judges_active', q: 'SELECT COUNT(*) as total_judges FROM Judges WHERE status = "Active"' },
    { name: 'judges_workload', q: 'SELECT name, workload FROM Judges' },
    { name: 'cases_pending', q: 'SELECT COUNT(*) as pending FROM Cases WHERE status = "Pending"' },
    { name: 'cases_completed', q: 'SELECT COUNT(*) as completed FROM Cases WHERE hearings_done >= 10' },
    { name: 'cases_group', q: 'SELECT case_type, COUNT(*) as count FROM Cases GROUP BY case_type' },
    { name: 'cases_dates', q: 'SELECT filing_date FROM Cases' }
];

async function runQueries() {
    for (const {name, q} of queries) {
        await new Promise(resolve => {
            db.all(q, [], (err, rows) => {
                if (err) {
                    console.log(`[${name}] ERROR:`, err.message);
                } else {
                    console.log(`[${name}] SUCCESS`);
                }
                resolve();
            });
        });
    }
}

runQueries();
