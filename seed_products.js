const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

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

    // Read products.json
    const productsPath = path.join(__dirname, 'products.json');
    fs.readFile(productsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading products.json:', err);
            db.end();
            return;
        }
        const products = JSON.parse(data);
        console.log(`Found ${products.length} products in JSON.`);

        // Truncate table
        db.query('TRUNCATE TABLE products', (err) => {
            if (err) {
                console.error('Error truncating table:', err);
                db.end();
                return;
            }
            console.log('Products table truncated.');

            // Insert products
            const sql = 'INSERT INTO products (name, category, price, oldPrice, image, type, tag, size) VALUES ?';
            const values = products.map(p => [
                p.name, p.category, p.price, p.oldPrice, p.image, p.type, p.tag, p.size
            ]);

            db.query(sql, [values], (err, result) => {
                if (err) {
                    console.error('Error inserting products:', err);
                } else {
                    console.log(`Successfully inserted ${result.affectedRows} products.`);
                }
                db.end();
            });
        });
    });
});
