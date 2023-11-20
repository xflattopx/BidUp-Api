// queue_service.js
const { Pool } = require('pg');

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

    const {result} = await pool.query(requestDetailsQuery, [customerId]);
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
