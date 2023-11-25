const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

let pool;
if (process.env.NODE_ENV !== 'development') {

    // Connect to PostgreSQL database
    pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: '1234',
        port: 5432,
    });
} else {
    pool = new Pool({
        host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

    });
}

router.use(cors());

router.post('/sign-up', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;

        // Check if required fields are present
        if (!role || !first_name || !last_name || !email || !password) {
            return res.status(403).json({ success: false, message: "Forbidden: Invalid object being sent to /register" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the users table
        const user = await pool.query(
            'INSERT INTO users(email, password, role) VALUES($1, $2, $3) RETURNING id',
            [email, hashedPassword, role]
        );
        let result;

        // Insert information based on role
        if (role === 'Driver') {
            result = await pool.query(
                'INSERT INTO drivers(user_id) VALUES($1) RETURNING id',
                [user.rows[0].id]
            );
        } else {
            result = await pool.query(
                'INSERT INTO customers(user_id, first_name, last_name) VALUES($1, $2, $3) RETURNING id',
                [user.rows[0].id, first_name, last_name]
            );
        }

        return res.status(201).json({ success: true, message: "User registered successfully", userId: user.rows[0].id, role });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


module.exports = router;