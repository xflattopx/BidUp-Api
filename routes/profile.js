const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');
const { REPL_MODE_SLOPPY } = require('repl');



router.use(cors)
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

router.get('/profile-request-details', async (req, res) => {
    try {
      const customerId = req.query.customerId; // Assuming you pass the customer's ID as a query parameter
  
      if (!customerId) {
        return res.status(400).json({ error: 'Missing required parameter: customerId' });
      }
  
      // Retrieve customer email by performing a select query
      const emailQuery = 'SELECT email FROM users WHERE id = $1';
      const emailResult = await pool.query(emailQuery, [customerId]);
  
      if (emailResult.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
  
      const customerEmail = emailResult.rows[0].email;
  
      // Use the customer's email to fetch the request history
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
          customers c ON dr.customer_id = c.id
        JOIN
          users u ON c.user_id = u.id
        WHERE
          u.email = $1;
      `;
  
      const { rows } = await pool.query(requestHistoryQuery, [customerEmail]);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching customer request history:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/cancel-request', async (req, res) => {
    try {
      const requestId = req.body.requestId; // Assuming you receive the requestId in the request body
  
      // Update the status to 'Canceled' for the specified request ID
      const cancelRequestQuery = `
        UPDATE delivery_requests
        SET status = 'Canceled'
        WHERE id = $1
        RETURNING id, pickup_location, dropoff_location, description, preferred_delivery_time, price_offer, status;
      `;
  
      const result = await pool.query(cancelRequestQuery, [requestId]);
  
      if (result.rowCount > 0) {
        const canceledRequest = result.rows[0];
        res.json({ success: true, canceledRequest });
      } else {
        res.status(404).json({ success: false, error: 'Request not found' });
      }
    } catch (error) {
      console.error('Error canceling request:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  
  



module.exports = router