// queue_service.js
const { Pool } = require('pg');
const pool = require('../config/config.js');



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
