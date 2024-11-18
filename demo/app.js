const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// MySQL database connection using environment variables
const db = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_DATABASE
});
// Connect to the MySQL database
db.connect(err => {
if (err) {
console.error('Error connecting to the database:', err);
return;
}
console.log('Connected to the MySQL database');
});
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
    if (err) {
    return res.status(500).json({ error: err.message });
    }
    res.json(results);
    });
    });
// Add product to the products table (new route for adding products)
app.post('/api/add-product', (req, res) => {
    const { name, price } = req.body;
    const insertProductQuery = 'INSERT INTO products (name, price) VALUES (?,?)';
    db.query(insertProductQuery, [name, price], (err, result) => {
    if (err) {
    return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Product added successfully', productId:
    result.insertId });
    });
    });

// Update product in the products table
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    const updateProductQuery = 'UPDATE products SET name = ?, price = ? WHERE id= ?';
    db.query(updateProductQuery, [name, price, id], (err, result) => {
    if (err) {
    return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Product updated successfully' });
    });
    });

    app.delete('/api/products/:id', (req, res) => {
        const { id } = req.params;
        const deleteProductQuery = 'DELETE FROM products WHERE id = ?';
        db.query(deleteProductQuery, [id], (err, result) => {
        if (err) {
        return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product deleted successfully' });
        });
        });

        app.post('/api/cart', (req, res) => {
            const { product_id, quantity } = req.body;
            const checkProductQuery = 'SELECT * FROM products WHERE id = ?';
            db.query(checkProductQuery, [product_id], (err, productResults) => {
            if (err) {
            return res.status(500).json({ error: err.message });
            }
            // Respond with a message if the product is not found
            if (productResults.length === 0) {
            return res.json({ message: 'Product not found, could not add to cart'
            });
            }
            const insertCartQuery = 'INSERT INTO cart (product_id, quantity) VALUES(?, ?)';
            db.query(insertCartQuery, [product_id, quantity], (err, cartResults) => {
            if (err) {
            return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Product added to cart', cartId:
            cartResults.insertId });
            });
            });
            });
            app.get('/api/cart', (req, res) => {
                const query = `
                SELECT p.name, p.price, c.quantity
                FROM cart c
                JOIN products p ON c.product_id = p.id
                `;
                db.query(query, (err, results) => {
                if (err) {
                return res.status(500).json({ error: err.message });
                }
                res.json(results);
                });
                });
// Update product quantity in the cart
app.put('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const updateCartQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
    db.query(updateCartQuery, [quantity, id], (err, result) => {
    if (err) {
    return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Cart item updated' });
    });
    });

    app.delete('/api/cart/:id', (req, res) => {
        const { id } = req.params;
        const deleteCartQuery = 'DELETE FROM cart WHERE id = ?';
        db.query(deleteCartQuery, [id], (err, result) => {
        if (err) {
        return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cart item deleted' });
        });
        });
// Start the server
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});