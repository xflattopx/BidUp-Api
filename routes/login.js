const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../config/config.js');


router.use(cors());
router.use(express.json());

router.post('/get-user', async (req, res, next) => {
    console.log(process.env.NODE_ENV)
    const { email, password } = req.body;

        try {
            // Retrieve the user from the database using the email
            const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (rows.length > 0) {
                const user = rows[0];

                // Compare the entered password with the hashed password in the database
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (passwordMatch) {
                    const user = rows[0];
                    const user_id = user.id;
                    const role = user.role;
                    const email = user.email;
                    let tokenPayload;

                    const passwordMatch = await bcrypt.compare(password, user.password);

                    if (passwordMatch) {


                        // Check if the user is a customer
                        const customerResult = await pool.query('SELECT * FROM customers WHERE user_id = $1', [user.id]);
                        const isCustomer = customerResult.rows.length > 0;

                        // Check if the user is a driver
                        const driverResult = await pool.query('SELECT * FROM drivers WHERE user_id = $1', [user.id]);
                        const isDriver = driverResult.rows.length > 0;

                        // Generate a token with user information and role
                        tokenPayload = {
                            userId: user.id,
                            email: user.email,
                            role: isCustomer ? 'Customer' : isDriver ? 'Driver' : 'unknown',
                        };
                    } else {
                        // Passwords do not match
                        res.status(401).json({ error: 'Invalid credentials' });
                    }

                    console.log(tokenPayload);

                    //make environemnt variable
                    const secretKey = crypto.randomBytes(64).toString('hex');
                    console.log('Generated secret key:', secretKey);

                    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1800s' });

                    res.status(200).json({ token, role, user_id, email });
                }
                
                else {
                    // User not found or invalid credentials
                    console.log('Invalid credentials.')
                    res.status(401).json({ error: 'Invalid credentials' });
                }
               
            } 
        }catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }});

module.exports = router;