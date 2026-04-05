const db = require('./database');
const fs = require('fs');

const queries = [
    'SELECT COUNT(*) as total_cases, AVG(priority) as avg_priority, MAX(priority) as high_priority FROM Cases',
    'SELECT COUNT(*) as total_judges FROM Judges WHERE status = "Active"',
    'SELECT name, workload FROM Judges',
    'SELECT COUNT(*) as pending FROM Cases WHERE status = "Pending"',
    'SELECT COUNT(*) as completed FROM Cases WHERE hearings_done >= 10',
    'SELECT case_type, COUNT(*) as count FROM Cases GROUP BY case_type',
    'SELECT filing_date FROM Cases'
];

let out = '';
let count = 0;

queries.forEach(q => {
    db.all(q, [], (err, rows) => {
        if (err) out += 'ERROR: ' + q + ' | ' + err.message + '\n';
        else out += 'OK: ' + q + ' | ' + JSON.stringify(rows) + '\n';
        
        count++;
        if (count === queries.length) {
            fs.writeFileSync('test_out.txt', out);
            console.log('done');
            process.exit(0);
        }
    });
});
