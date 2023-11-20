var express = require('express');
var router = express.Router();
const cors = require('cors');
var { Pool } = require('pg');
const bodyParser = require('body-parser');

router.use(cors());
// Connect to PostgreSQL database
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
  INSERT INTO delivery_requests (pickup_location, dropoff_location, description, preferred_delivery_time, price_offer, status, customer_id)
    VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
    RETURNING id
  `;

  try {
      // Execute the SQL query
      const result = await db.query(insertQuery, [
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
    const result = await db.query(query, ['Sold', 'Canceled']);

    // Send the result as a JSON response
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving rows:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;