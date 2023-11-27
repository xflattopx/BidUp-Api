const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
var pool = require('../config/config.js');
const { Connector } = require('@google-cloud/cloud-sql-connector');
let clientOpts;
if(process.env.ENV_NODE === 'development'){
    const connector = new Connector();
    clientOpts = (async) => connector.getOptions({
        instanceConnectionName: 'bidup-405619:us-east1:postgres',
        ipType: 'PUBLIC',
    });
}

pool = new Pool({
    ...clientOpts,
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '34.148.8.228',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    port: 5432,
    max: 5,
  });

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
