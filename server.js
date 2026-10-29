const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');
const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

const ADMIN_EMAILS = ['Chayaphat7184@gmail.com', 'jummum128@gmail.com', 'kvtd@gmail.com'];
const SYSTEM_USER_ID = 999;

// MySQL Connection Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'reloop_db'
};

// Initialize Database and Connection
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL server:', err);
        return;
    }
    console.log('Connected to MySQL server');

    // Create Database if not exists
    db.query('CREATE DATABASE IF NOT EXISTS reloop_db', (err) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log('Database reloop_db checked/created');

        // Use the database
        db.changeUser({ database: 'reloop_db' }, (err) => {
            if (err) {
                console.error('Error switching to reloop_db:', err);
                return;
            }
            console.log('Using database reloop_db');

            // --- DATEBASE SCHEMAS ---

            // Users Table
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    profile_image LONGTEXT,
                    bio TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            db.query(createUsersTable, (err) => {
                if (err) console.error('Error creating users table:', err);
                else {
                    console.log('Users table checked/created');
                    db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image LONGTEXT");
                    db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT");
                }
            });

            // Products Table
            const createProductsTable = `
                CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(255),
                    price DECIMAL(10, 2) NOT NULL,
                    oldPrice DECIMAL(10, 2),
                    image LONGTEXT,
                    type VARCHAR(50),
                    tag VARCHAR(50),
                    size VARCHAR(50),
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            db.query(createProductsTable, (err) => {
                if (err) console.error('Error creating products table:', err);
                else {
                    console.log('Products table checked/created');
                    // Migration: Ensure status, stock, user_id columns exist
                    db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available'", (err) => {
                        if (err) console.error('Error adding status column:', err);
                    });
                    db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 1", (err) => {
                        if (err) console.error('Error adding stock column:', err);
                    });
                    db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id INT", (err) => {
                        // Ignore error if exists
                    });

                    // Migration: Backfill existing products with user_id = SYSTEM_USER_ID (System/Admin) if null
                    // Also ensure original seeded products (ids 1-50) belong to System
                    db.query("UPDATE products SET user_id = ? WHERE user_id IS NULL OR id <= 50", [SYSTEM_USER_ID], (err) => {
                        if (err) console.error('Error backfilling user_id:', err);
                        else console.log('Backfilled user_id for system products');
                    });

                    seedProducts();
                }
            });

            // Orders Table
            const createOrdersTable = `
                CREATE TABLE IF NOT EXISTS orders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    total_amount DECIMAL(10, 2) NOT NULL,
                    shipping_address TEXT,
                    status VARCHAR(50) DEFAULT 'shipping',
                    estimated_delivery DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            db.query(createOrdersTable, (err) => {
                if (err) console.error('Error creating orders table:', err);
                else {
                    console.log('Orders table checked/created');
                    // Migration: Ensure columns exist
                    db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'shipping'");
                    db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE");
                    db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS username VARCHAR(255)");
                    db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS email VARCHAR(255)");
                }
            });

            // Order Items Table
            const createOrderItemsTable = `
                CREATE TABLE IF NOT EXISTS order_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT,
                    product_id INT,
                    quantity INT NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    FOREIGN KEY (order_id) REFERENCES orders(id)
                )
            `;
            db.query(createOrderItemsTable, (err) => {
                if (err) console.error('Error creating order_items table:', err);
                else console.log('Order Items table checked/created');
            });

            // Conversations Table
            const createConversationsTable = `
                CREATE TABLE IF NOT EXISTS conversations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT,
                    buyer_id INT,
                    seller_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                )
            `;
            db.query(createConversationsTable, (err) => {
                if (err) console.error('Error creating conversations table:', err);
                else console.log('Conversations table checked/created');
            });

            // Messages Table
            const createMessagesTable = `
                CREATE TABLE IF NOT EXISTS messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    conversation_id INT,
                    sender_id INT,
                    content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
                )
            `;
            db.query(createMessagesTable, (err) => {
                if (err) console.error('Error creating messages table:', err);
                else {
                    console.log('Messages table checked/created');

                    // Migration: Ensure existing conversations for System Products (1-50) have seller_id = 999
                    db.query("UPDATE conversations SET seller_id = 999 WHERE product_id <= 50", (err) => {
                        if (err) console.error('Error migrating conversations:', err);
                        else console.log('Migrated conversations for system products');
                    });
                }
            });

        });
    });
});

// Seed Products Function
function seedProducts() {
    db.query('SELECT COUNT(*) as count FROM products', (err, results) => {
        if (err) return;
        if (results[0].count === 0) {
            console.log('Seeding products...');
            fs.readFile(path.join(__dirname, 'products.json'), 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading products.json:', err);
                    return;
                }
                const products = JSON.parse(data);
                const sql = 'INSERT INTO products (name, category, price, oldPrice, image, type, tag, size, user_id) VALUES ?';
                const values = products.map(p => [
                    p.name, p.category, p.price, p.oldPrice, p.image, p.type, p.tag, p.size, SYSTEM_USER_ID
                ]);

                db.query(sql, [values], (err) => {
                    if (err) console.error('Error seeding products:', err);
                    else console.log('Products seeded successfully');
                });
            });
        }
    });
}

// --- API ENDPOINTS ---

// Get Products
app.get('/api/products', (req, res) => {
    let sql = 'SELECT * FROM products';
    const type = req.query.type;
    const params = [];

    if (type) {
        sql += ' WHERE type = ?';
        params.push(type);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// Create Product (Sell)
app.post('/api/products', (req, res) => {
    const { name, category, price, description, image, type, user_id } = req.body;

    let productType = type;
    if (!productType) {
        if (category === 'เสื้อ') productType = 'shirt';
        else if (category === 'กางเกง') productType = 'pant';
        else if (category === 'รองเท้า') productType = 'shoe';
        else if (category === 'กระโปรง') productType = 'skirt';
        else if (category === 'กระเป๋า') productType = 'bag';
        else productType = 'other';
    }

    const sql = 'INSERT INTO products (name, category, price, description, image, type, tag, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, category, price, description, image, productType, 'New', user_id], (err, result) => {
        if (err) {
            console.error('Error creating product:', err);
            return res.status(500).json({ success: false, message: 'Failed to create product' });
        }
        res.json({ success: true, message: 'Product created successfully', id: result.insertId });
    });
});

// Admin Update Product Status
app.put('/api/products/:id/status', (req, res) => {
    const productId = req.params.id;
    const { status, stock, email } = req.body;

    console.log(`Updating product ${productId}: status=${status}, stock=${stock}, requestedBy=${email}`);

    if (!email || !ADMIN_EMAILS.includes(email)) {
        return res.status(403).json({ success: false, message: 'Unauthorized: Only admins can perform this action' });
    }

    if (!['available', 'sold'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let sql = 'UPDATE products SET status = ?';
    const params = [status];

    if (stock !== undefined) {
        sql += ', stock = ?';
        params.push(stock);
    }

    sql += ' WHERE id = ?';
    params.push(productId);

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error updating product status:', err);
            return res.status(500).json({ success: false, message: 'Failed to update status' });
        }
        res.json({ success: true, message: 'Product status updated' });
    });
});

// Create Order (Checkout)
app.post('/api/orders', (req, res) => {
    console.log('Received order request:', req.body);
    const { cart, user_id, username, email, total_amount, shipping_address } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Check availability
    const checkPromises = cart.map(item => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id, name, status, stock FROM products WHERE id = ?', [item.id], (err, results) => {
                if (err) return reject(err);

                if (results.length === 0) {
                    return resolve({ available: false, product: { name: item.name + ' (ไม่พบสินค้าในระบบ)' } });
                }

                const product = results[0];
                if (product.status === 'sold' || product.stock < item.quantity) {
                    return resolve({ available: false, product });
                }
                resolve({ available: true, product });
            });
        });
    });

    Promise.all(checkPromises)
        .then(results => {
            const unavailable = results.filter(r => !r.available);
            if (unavailable.length > 0) {
                const names = unavailable.map(u => u.product.name).join(', ');
                return res.status(400).json({
                    success: false,
                    message: `สินค้าต่อไปนี้หมดหรือมีจำนวนไม่พอ: ${names}. กรุณาลบออกจากตะกร้า`
                });
            }

            // Begin Transaction
            db.beginTransaction((err) => {
                if (err) return res.status(500).json({ success: false, message: 'Transaction error' });

                const estimatedDelivery = new Date();
                estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

                const orderSql = 'INSERT INTO orders (user_id, username, email, total_amount, shipping_address, status, estimated_delivery) VALUES (?, ?, ?, ?, ?, ?, ?)';
                db.query(orderSql, [user_id || null, username || 'Guest', email || 'Guest', total_amount, shipping_address, 'preparing', estimatedDelivery], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error creating order:', err);
                            res.status(500).json({ success: false, message: 'Failed to create order: ' + err.message });
                        });
                    }

                    const orderId = result.insertId;
                    const orderItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
                    const orderItemsValues = cart.map(item => [orderId, item.id, item.quantity, item.price]);

                    db.query(orderItemsSql, [orderItemsValues], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error creating order items:', err);
                                res.status(500).json({ success: false, message: 'Failed to create order items: ' + err.message });
                            });
                        }

                        // Deduct stock
                        const updatePromises = cart.map(item => {
                            return new Promise((resolve, reject) => {
                                db.query('SELECT stock FROM products WHERE id = ?', [item.id], (err, results) => {
                                    if (err) return reject(err);
                                    const currentStock = results[0].stock;
                                    const newStock = currentStock - item.quantity;
                                    const newStatus = newStock <= 0 ? 'sold' : 'available';

                                    db.query('UPDATE products SET stock = ?, status = ? WHERE id = ?',
                                        [newStock, newStatus, item.id],
                                        (err) => {
                                            if (err) reject(err);
                                            else resolve();
                                        }
                                    );
                                });
                            });
                        });

                        Promise.all(updatePromises)
                            .then(() => {
                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            res.status(500).json({ success: false, message: 'Transaction commit error' });
                                        });
                                    }
                                    res.json({ success: true, message: 'Order placed successfully', orderId });
                                });
                            })
                            .catch(err => {
                                db.rollback(() => {
                                    console.error('Error updating stock:', err);
                                    res.status(500).json({ success: false, message: 'Failed to update stock' });
                                });
                            });
                    });
                });
            });
        })
        .catch(err => {
            console.error('Error checking availability:', err);
            res.status(500).json({ success: false, message: 'Server error during checkout: ' + err.message });
        });
});

// Register
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).json({ success: false, message: 'Registration failed' });
        }
        res.json({ success: true, message: 'User registered successfully' });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    const sql = 'SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?';
    db.query(sql, [email, email, password], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).json({ success: false, message: 'Login failed' });
        }
        if (results.length > 0) {
            res.json({ success: true, message: 'Login successful', user: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Get User
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT id, username, email, profile_image, bio FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch user' });
        }
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

// Update User
app.post('/api/user/update', (req, res) => {
    const { id, profile_image, bio } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Missing required fields' });

    let sql = 'UPDATE users SET ';
    const params = [];

    if (profile_image) {
        sql += 'profile_image = ?, ';
        params.push(profile_image);
    }
    if (bio !== undefined) {
        sql += 'bio = ?, ';
        params.push(bio);
    }

    if (params.length > 0) {
        sql = sql.slice(0, -2);
        sql += ' WHERE id = ?';
        params.push(id);

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Error updating profile:', err);
                return res.status(500).json({ success: false, message: 'Failed to update profile' });
            }
            res.json({ success: true, message: 'Profile updated successfully' });
        });
    } else {
        res.json({ success: true, message: 'Nothing to update' });
    }
});

// Get User Orders
app.get('/api/orders/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT o.id, o.total_amount, o.status, o.estimated_delivery, o.created_at, 
               oi.product_id, p.name as product_name, p.image as product_image, oi.quantity, oi.price
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
        }
        const orders = {};
        results.forEach(row => {
            if (!orders[row.id]) {
                orders[row.id] = {
                    id: row.id,
                    total_amount: row.total_amount,
                    status: row.status,
                    estimated_delivery: row.estimated_delivery,
                    created_at: row.created_at,
                    items: []
                };
            }
            orders[row.id].items.push({
                product_id: row.product_id,
                name: row.product_name,
                image: row.product_image,
                quantity: row.quantity,
                price: row.price
            });
        });
        res.json({ success: true, orders: Object.values(orders) });
    });
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [productId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete product' });
        res.json({ success: true, message: 'Product deleted' });
    });
});

// Chat Start
app.post('/api/chat/start', (req, res) => {
    const { product_id, buyer_id, seller_id } = req.body;
    if (!product_id || !buyer_id || !seller_id) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const checkSql = 'SELECT * FROM conversations WHERE product_id = ? AND buyer_id = ? AND seller_id = ?';
    db.query(checkSql, [product_id, buyer_id, seller_id], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (results.length > 0) return res.json({ success: true, conversationId: results[0].id });

        const insertSql = 'INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES (?, ?, ?)';
        db.query(insertSql, [product_id, buyer_id, seller_id], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, conversationId: result.insertId });
        });
    });
});

// Chat List
// Chat List
app.get('/api/chat/user/:userId', (req, res) => {
    const userId = req.params.userId;

    // First check if user is admin
    db.query('SELECT email FROM users WHERE id = ?', [userId], (err, users) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        let isAdmin = false;
        if (users.length > 0) {
            const userEmail = users[0].email.toLowerCase();
            const adminEmailsLower = ADMIN_EMAILS.map(e => e.toLowerCase());
            if (adminEmailsLower.includes(userEmail)) {
                isAdmin = true;
            }
        }

        let sql = `
            SELECT c.*, p.name as product_name, p.image as product_image, 
                   u_buyer.username as buyer_name, 
                   CASE 
                       WHEN c.seller_id = 999 OR c.seller_id = 1 THEN COALESCE(u_seller.username, 'Admin') 
                       ELSE u_seller.username 
                   END as seller_name
            FROM conversations c
            JOIN products p ON c.product_id = p.id
            LEFT JOIN users u_buyer ON c.buyer_id = u_buyer.id
            LEFT JOIN users u_seller ON c.seller_id = u_seller.id
            WHERE c.buyer_id = ? OR c.seller_id = ?
        `;

        if (isAdmin) {
            sql += ' OR c.seller_id = 999 OR c.seller_id = 1';
        }

        sql += ' ORDER BY c.created_at DESC';

        db.query(sql, [userId, userId], (err, results) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json(results);
        });
    });
});

// Chat Messages
app.get('/api/chat/:conversationId', (req, res) => {
    const conversationId = req.params.conversationId;
    const sql = `
        SELECT m.*, 
               CASE 
                   WHEN m.sender_id = 999 THEN COALESCE(u.username, 'Admin') 
                   ELSE u.username 
               END as sender_name 
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE conversation_id = ?
        ORDER BY m.created_at ASC
    `;
    db.query(sql, [conversationId], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(results);
    });
});

// Send Message
app.post('/api/chat/:conversationId/messages', (req, res) => {
    const conversationId = req.params.conversationId;
    const { sender_id, content } = req.body;
    const sql = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
    db.query(sql, [conversationId, sender_id, content], (err, result) => {
        if (err) {
            console.error('Error sending message:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true });
    });
});

// Delete Chat (Admin Only or Participant)
app.delete('/api/chat/:conversationId', (req, res) => {
    const conversationId = req.params.conversationId;
    const { userId } = req.body; // Requester ID

    console.log(`[DELETE Chat] Request received for Order ${conversationId} by User ${userId}`);

    if (!userId) return res.status(400).json({ success: false, message: 'Missing user ID' });

    db.query('SELECT email FROM users WHERE id = ?', [userId], (err, users) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

        const email = users[0].email.trim().toLowerCase();
        const isAdmin = ADMIN_EMAILS.map(e => e.trim().toLowerCase()).includes(email);

        console.log(`[DELETE Chat] User Email: '${email}', Is Admin: ${isAdmin}`);

        if (!isAdmin) {
            console.log(`[DELETE Chat] Access Denied. User '${email}' is not in Admin list: ${ADMIN_EMAILS.join(', ')}`);
        }

        let sql = 'DELETE FROM conversations WHERE id = ?';
        let params = [conversationId];

        if (!isAdmin) {
            // If not admin, ensure they are part of the chat
            sql += ' AND (buyer_id = ? OR seller_id = ?)';
            params.push(userId, userId);
            console.log(`[DELETE Chat] Not Admin. Restricting delete to participant.`);
        } else {
            console.log(`[DELETE Chat] Admin privilege granted.`);
        }

        // Manual Cascade Delete: Delete messages first
        db.query('DELETE FROM messages WHERE conversation_id = ?', [conversationId], (err) => {
            if (err) {
                console.error('[DELETE Chat] Message delete error:', err);
                return res.status(500).json({ success: false, error: 'Failed to delete messages: ' + err.message });
            }

            // Then delete conversation
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('[DELETE Chat] Conversation delete error:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                if (result.affectedRows === 0) {
                    console.warn(`[DELETE Chat] Failed. Rows affected: 0. SQL: ${sql} Params: ${params}`);
                    return res.status(403).json({ success: false, message: 'Permission denied or chat not found (or already deleted)' });
                }
                console.log(`[DELETE Chat] Success.`);
                res.json({ success: true, message: 'Conversation deleted' });
            });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
