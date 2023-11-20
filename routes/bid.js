const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');

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

}

router.use(cors());

// API endpoint to record bids
router.post('/record-bid', async (req,res,next) => {
    const { deliveryRequestId, driverId, bidPrice } = req.body;
    console.log(deliveryRequestId)
    try {
      // Step 1: Update bid_end_time in delivery_requests
      const bidEndTimeUpdateQuery = `
        UPDATE delivery_requests
        SET bid_end_time = CURRENT_TIMESTAMP + INTERVAL '5 minutes', status = 'Bidding'
        WHERE id = $1
        RETURNING id;
      `;
  
      const bidEndTimeUpdateResult = await pool.query(bidEndTimeUpdateQuery, [deliveryRequestId]);
      console.log(bidEndTimeUpdateQuery)
      // Check if the bid_end_time was updated successfully
      if (bidEndTimeUpdateResult.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Delivery request not found.' });
      }
  
      const requestId = bidEndTimeUpdateResult.rows[0].id;
  
      // Step 2: Insert the bid into the bids table
      const insertBidQuery = `
        INSERT INTO bids (driver_id, delivery_request_id, bid_price, status)
        VALUES ($1, $2, $3, 'Bidding')
        RETURNING id;
      `;
  
      const insertBidResult = await pool.query(insertBidQuery, [driverId, deliveryRequestId, bidPrice]);
      // Check if the bid was inserted successfully
      if (insertBidResult.rowCount === 0) {
        return res.status(500).json({ success: false, message: 'Error recording bid.' });
      }
  
      // Respond with success
      res.json({ success: true, message: 'Bid recorded successfully.', requestId: requestId });
    } catch (error) {
      console.error('Error recording bid:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });

 // API endpoint to update a bid
router.post('/update-bid', async (req, res) => {
  const { bidId, newBidPrice, driverId } = req.body;
  console.log(bidId)
  try {
    // Fetch the bid details including the current bid_price
    const getBidDetailsQuery = `
      SELECT bid_price, delivery_request_id, driver_id
      FROM bids
      WHERE delivery_request_id = $1;
    `;

    const bidDetailsResult = await pool.query(getBidDetailsQuery, [bidId]);
    console.log(bidDetailsResult);
    if (bidDetailsResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Bid not found.' });
    }

    const { bid_price, delivery_request_id, driver_id } = bidDetailsResult.rows[0];

    // Check if the provided driverId matches the driver who placed the original bid
    if (driverId !== driver_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You cannot update bids placed by other drivers.' });
    }

    // Update the bid_price in the bids table
    const updateBidPriceQuery = `
      UPDATE bids
      SET bid_price = $1
      WHERE delivery_request_id = $2;
    `;

    await pool.query(updateBidPriceQuery, [newBidPrice, bidId]);
  
    // Update the bid_price in the delivery_requests table
    const updateDeliveryRequestPriceQuery = `
      UPDATE delivery_requests
      SET price_offer = $1
      WHERE id = $2;
    `;

    await pool.query(updateDeliveryRequestPriceQuery, [newBidPrice, delivery_request_id]);

    // Respond with success
    res.json({ success: true, message: 'Bid updated successfully.' });
  } catch (error) {
    console.error('Error updating bid:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

  // API endpoint to record the winning bid
router.post('/record-winning-bid', async (req, res) => {
    const { bidId } = req.body;
   // console.log(bidId)
    try {
      // Update the status in the bids table to "Sold"
      const updateBidStatusQuery = `
        UPDATE bids
        SET status = 'Bidding'
        WHERE delivery_request_id = $1
        RETURNING delivery_request_id;
      `;
  
      const updateBidStatusResult = await pool.query(updateBidStatusQuery, [bidId]);
  
      // Check if the bid status was updated successfully
      if (updateBidStatusResult.rowCount === 0) {
        console.log(updateBidStatusQuery)
        return res.status(404).json({ success: false, message: 'Bid not found.' });
      }
  
      const deliveryRequestId = updateBidStatusResult.rows[0].delivery_request_id;
  
      // Update the status in the delivery_requests table to "Sold"
      const updateDeliveryRequestStatusQuery = `
        UPDATE delivery_requests
        SET status = 'Bidding'
        WHERE id = $1;
      `;
  
      await pool.query(updateDeliveryRequestStatusQuery, [deliveryRequestId]);
  
      // Respond with success
      res.json({ success: true, message: 'Winning bid recorded successfully.' });
    } catch (error) {
      console.error('Error recording winning bid:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });

// Schedule a task to check bids every minute
cron.schedule('* * * * *', async () => {
  try {
    // Get the bids that are still pending and their bid end times are in the past
    const checkBidsQuery = `
      UPDATE bids
      SET status = 'Sold'
      FROM delivery_requests
      WHERE bids.status = 'Bidding'
        AND bids.bid_time + interval '5 minutes' <= CURRENT_TIMESTAMP
        AND bids.delivery_request_id = delivery_requests.id
        AND delivery_requests.status = 'Bidding'
      RETURNING bids.id as bid_id, bids.driver_id, delivery_requests.id as delivery_request_id;
    `;

    const result = await pool.query(checkBidsQuery);
    //console.log(result);

    if (result.rowCount > 0) {
      console.log('Updated bids with status "Sold"');

      // Store delivery_request_ids from the checkBidsQuery result
      const processedDeliveryRequests = result.rows.map((row) => row.delivery_request_id);

      // Iterate through the updated bids and insert them into winning_bids table
      for (const row of result.rows) {
        const { bid_id, driver_id, delivery_request_id } = row;

        const insertWinningBidQuery = `
        INSERT INTO winning_bids (bid_id, delivery_request_id)
        VALUES ($1, $2)
        ON CONFLICT (delivery_request_id) DO NOTHING;        
        `;

        // Insert winning bid into winning_bids table
        await pool.query(insertWinningBidQuery, [bid_id, delivery_request_id]);

        console.log(`Inserted winning bid with bid_id ${bid_id} into winning_bids`);
      }

      // Update the status of delivery_requests to 'Sold' for the processed bids
      const updateDeliveryRequestsQuery = `
        UPDATE delivery_requests
        SET status = 'Sold'
        WHERE id IN (${processedDeliveryRequests.join(',')});
      `;
      await pool.query(updateDeliveryRequestsQuery);
    }
  } catch (error) {
    console.error('Error checking and inserting winning bids:', error);
  }
});



  module.exports = router;