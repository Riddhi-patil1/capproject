const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'justiceos.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening db', err);
        process.exit(1);
    }
    
    db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
        if (err) {
            console.error('Error listing tables', err);
            process.exit(1);
        }
        console.log('Tables:', tables.map(t => t.name).join(', '));
        
        db.get("SELECT COUNT(*) as count FROM Judges", (err, row) => {
           console.log('Judges Count:', row ? row.count : 'Error/None');
           
           db.get("SELECT COUNT(*) as count FROM Cases", (err, row2) => {
               console.log('Cases Count:', row2 ? row2.count : 'Error/None');
               db.close();
           });
        });
    });
});
