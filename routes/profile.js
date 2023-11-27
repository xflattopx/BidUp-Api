const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');
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

router.get('/profile-request-details', async (req, res) => {
  try {
    const customerId = req.query.customerId;

    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: customerId' });
    }

    const emailQuery = 'SELECT email FROM users WHERE id = $1';
    const emailResult = await pool.query(emailQuery, [customerId]);
    console.log(emailResult)

    if (emailResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const customerEmail = emailResult.rows[0].email;


    const requestHistoryQuery = `
    SELECT
      dr.id AS ID,
      dr.pickup_location AS "pickupLocation",
      dr.dropoff_location AS "dropoffLocation",
      dr.description AS description,
      dr.preferred_delivery_time AS "preferredDeliveryTime",
      dr.price_offer AS "priceOffer",
      dr.status AS status
    FROM
      delivery_requests dr
    JOIN
      customers c ON dr.user_id = c.user_id
    JOIN
      users u ON c.user_id = u.id
    WHERE
      u.email = $1;
  `;

    const { rows } = await pool.query(requestHistoryQuery, [customerEmail]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching customer request history:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/profile-personal-details', async (req, res) => {
  try {
    const customerId = req.query.customerId;

    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: customerId' });
    }

    // Retrieve customer details (first_name, last_name, email) based on the customerId
    const customerDetailsQuery = `
      SELECT c.first_name, c.last_name, u.email
      FROM customers c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1;
    `;

    const customerDetailsResult = await pool.query(customerDetailsQuery, [customerId]);

    if (customerDetailsResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const customerProfile = customerDetailsResult.rows[0];

    // Return the customer profile details
    res.json({ success: true, customerProfile });
  } catch (error) {
    console.error('Error fetching customer profile details:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.post('/cancel-request', async (req, res) => {
  try {
    const requestId = req.body.requestId;

    const cancelRequestQuery = `
      UPDATE delivery_requests
      SET status = 'Canceled'
      WHERE id = $1
      RETURNING id, pickup_location, dropoff_location, description, preferred_delivery_time, price_offer, status;
    `;

    const result = await pool.query(cancelRequestQuery, [requestId]);

    if (result.rowCount > 0) {
      const canceledRequest = result.rows[0];
      res.json({ success: true, data: canceledRequest });
    } else {
      res.status(404).json({ success: false, error: 'Request not found' });
    }
  } catch (error) {
    console.error('Error canceling request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


module.exports = router;
