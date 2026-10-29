const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'reloop_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to DB:', err);
        process.exit(1);
    }
    console.log('Connected to DB');

    const queries = [
        // Add username and email to orders table
        "ALTER TABLE orders ADD COLUMN username VARCHAR(255)",
        "ALTER TABLE orders ADD COLUMN email VARCHAR(255)",

        // Add status to products table
        "ALTER TABLE products ADD COLUMN status VARCHAR(50) DEFAULT 'available'"
    ];

    let completed = 0;
    queries.forEach(query => {
        db.query(query, (err) => {
            if (err) {
                // Ignore duplicate column errors
                if (err.code !== 'ER_DUP_FIELDNAME') {
                    console.error('Error executing query:', err.message);
                } else {
                    console.log('Column already exists, skipping.');
                }
            } else {
                console.log('Schema updated successfully.');
            }
            completed++;
            if (completed === queries.length) {
                db.end();
            }
        });
    });
});
