const db = require('./database');

const queries = [
    'SELECT COUNT(id) as total_cases, AVG(priority) as avg_priority, MAX(priority) as high_priority FROM Cases',
    'SELECT COUNT(id) as total_judges FROM Judges WHERE status = "Active"',
    'SELECT name, workload FROM Judges',
    'SELECT COUNT(id) as pending FROM Cases WHERE status = "Pending"',
    'SELECT COUNT(id) as completed FROM Cases WHERE hearings_done >= 10',
    'SELECT case_type, COUNT(id) as count FROM Cases GROUP BY case_type',
    'SELECT filing_date FROM Cases'
];

setTimeout(() => {
    queries.forEach(q => {
        db.all(q, [], (err, rows) => {
            if (err) console.log('ERROR: ' + q + ' | ' + err.message);
            else console.log('OK: ' + q);
        });
    });
}, 1000);
