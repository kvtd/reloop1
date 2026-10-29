const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'reloop_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');

    // Update ALL orders to 'preparing'
    db.query("UPDATE orders SET status = 'preparing'", (err, result) => {
        if (err) {
            console.error('Error updating orders:', err);
        } else {
            console.log(`Updated ${result.changedRows} orders to 'preparing' status.`);
        }
        db.end();
        process.exit(0);
    });
});
