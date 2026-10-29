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
    db.query('SELECT id, name FROM products', (err, results) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Products:', results.length);
            results.forEach(p => console.log(`${p.id}: ${p.name}`));
        }
        db.end();
    });
});
