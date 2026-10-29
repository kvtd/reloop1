const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Using the password from server.js
    database: 'reloop_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');

    // Get all orders
    db.query('SELECT id FROM orders', (err, orders) => {
        if (err) {
            console.error('Error fetching orders:', err);
            process.exit(1);
        }

        console.log(`Found ${orders.length} orders. Updating statuses...`);

        const statuses = ['preparing', 'picked_up', 'shipping'];
        let updatedCount = 0;

        orders.forEach((order, index) => {
            // Distribute statuses round-robin style or random
            const newStatus = statuses[index % statuses.length];

            db.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, order.id], (err) => {
                if (err) {
                    console.error(`Error updating order ${order.id}:`, err);
                } else {
                    console.log(`Order ${order.id} updated to ${newStatus}`);
                }

                updatedCount++;
                if (updatedCount === orders.length) {
                    console.log('All orders updated.');
                    db.end();
                    process.exit(0);
                }
            });
        });

        if (orders.length === 0) {
            console.log('No orders found to update.');
            db.end();
            process.exit(0);
        }
    });
});
