const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');
const pool = require('../config/config.js');


router.use(cors());

router.get('/accepted-bids', async (req, res) => {
    try {
      const { userId } = req.query;
  
      const winningBidsQuery = (`
        SELECT
          dr.id AS delivery_request_id,
          dr.pickup_location,
          dr.dropoff_location,
          dr.description,
          dr.price_offer
        FROM
          delivery_requests dr
        JOIN
          winning_bids wb ON dr.id = wb.delivery_request_id
        JOIN
          bids b ON wb.bid_id = b.id
        JOIN
          drivers d ON b.driver_id = d.user_id
        WHERE
          b.status = 'Sold' AND d.user_id = $1;
      `);

      const query = await pool.query(winningBidsQuery, [userId]);
      console.log(query);
    
      res.json([query]);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;