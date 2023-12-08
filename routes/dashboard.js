const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');
//const pool = require('../config/config.js');
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
  user: process.env.DB_USER || 'time_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'time_db',
  password: process.env.DB_PASSWORD || 'time_password',
  port: 5432,
  max: 5,
});

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