const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
router.use(express.json());

router.post('/get-user', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Assuming you have a 'users' table with columns 'id', 'email', 'password'
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        
        console.log(rows);

        if (rows.length > 0) {
            const user = rows[0];
            const user_id = user.id;
            const role = user.role;
            const email = user.email;
            

            // Check if the user is a customer
            const customerResult = await pool.query('SELECT * FROM customers WHERE user_id = $1', [user.id]);
            const isCustomer = customerResult.rows.length > 0;

            // Check if the user is a driver
            const driverResult = await pool.query('SELECT * FROM drivers WHERE user_id = $1', [user.id]);
            const isDriver = driverResult.rows.length > 0;

            // Generate a token with user information and role
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                role: isCustomer ? 'Customer' : isDriver ? 'Driver' : 'unknown',
            };

            console.log(tokenPayload);

            //make environemnt variable
            const secretKey = crypto.randomBytes(64).toString('hex');
            console.log('Generated secret key:', secretKey);

            const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1800s' });

            res.status(200).json({ token,role, user_id, email});
        } else {
            // User not found or invalid credentials
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;