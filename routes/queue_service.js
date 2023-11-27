// queue_service.js
const { Pool } = require('pg');
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

async function getUpdatedQueue() {
  try {
    // Implement logic to fetch the updated queue from the database
    // For example:
    const query = 'SELECT * FROM delivery_requests WHERE status IN ($1, $2)';
    const result = await pool.query(query, ['Pending', 'Bidding']);
    return result.rows;
  } catch (error) {
    console.error('Error fetching updated queue:', error);
    throw error;
  }
}

async function getProfileRequestDetails(customerId) {
  try {
    // Fetch the request details from the database based on the customerId
    const requestDetailsQuery = `
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
      WHERE
        c.id = $1;
    `;

    const { result } = await pool.query(requestDetailsQuery, [customerId]);
    console.log(rows);
    return result.rows;
  } catch (error) {
    console.error('Error fetching profile request details:', error);
    throw error; // You might want to handle this error more gracefully in a production environment
  }
}

module.exports = {
  getUpdatedQueue,
  getProfileRequestDetails
};
