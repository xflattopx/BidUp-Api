var express = require('express');
var router = express.Router();
const cors = require('cors');
var { Pool } = require('pg');
//const pool = require('../config/config.js');
var pool = require('../config/config.js');
const { Connector } = require('@google-cloud/cloud-sql-connector');
let clientOpts;
const connector = new Connector();
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


router.post('/', async function (req, res, next) {
  // Retrieve data from the request body
  console.log('HERE -> Received POST request to /customer_request');
  var requestData = req.body;
  console.log(requestData)


  // Validate the required fields
  if (!requestData.pickupLocation || !requestData.dropOffLocation || !requestData.description || !requestData.preferredDeliveryTime || requestData.priceOffer === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // SQL to store data in the 'requests' table
  var insertQuery = `
  INSERT INTO delivery_requests (pickup_location, dropoff_location, description, preferred_delivery_time, price_offer, status, user_id)
    VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
    RETURNING id
  `;

  try {
      // Execute the SQL query
      
      const result = await pool.query(insertQuery, [
          requestData.pickupLocation,
          requestData.dropOffLocation,
          requestData.description,
          requestData.preferredDeliveryTime,
          requestData.priceOffer,
          requestData.customerId
      ]);


      // Get the ID of the inserted row
      const requestId = result.rows[0].id;
      //console.log('Data stored successfully. Request ID:', requestId);

      // Respond with the inserted data
      return req.body;
  } catch (err) {
      console.error('Error storing data:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// Route to retrieve all pending rows excluding 'Canceled'
router.get('/all', async function (req, res, next) {
  try {
    // Query to retrieve all rows except those with status "Sold" and "Canceled"
    const query = 'SELECT id, pickup_location, dropoff_location, description, preferred_delivery_time, price_offer, status FROM delivery_requests WHERE status NOT IN ($1, $2)';

    // Execute the query
    const result = await pool.query(query, ['Sold', 'Canceled']);

    // Send the result as a JSON response
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving rows:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;