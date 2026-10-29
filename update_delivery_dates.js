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

    // Update orders with NULL estimated_delivery
    // Set it to 3 days after created_at, or 3 days from now if created_at is problematic
    const sql = `
        UPDATE orders 
        SET estimated_delivery = DATE_ADD(created_at, INTERVAL 3 DAY) 
        WHERE estimated_delivery IS NULL
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error updating delivery dates:', err);
        } else {
            console.log(`Updated ${result.changedRows} orders with missing delivery dates.`);
        }
        db.end();
        process.exit(0);
    });
});
