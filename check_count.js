const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'reloop_db'
});

db.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    db.query('SELECT COUNT(*) as count FROM products', (err, results) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Product count in DB:', results[0].count);
        }
        db.end();
    });
});
