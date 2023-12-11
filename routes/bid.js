const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const cors = require('cors');
const cron = require('node-cron');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

router.use(cors());

router.post('/record-bid', async (req, res, next) => {
  const {deliveryRequestId, driverId, bidPrice} = req.body;

  try {
    const deliveryRequest = await prisma.deliveryRequest.update({
      where: {id: deliveryRequestId},
      data: {
        bid_end_time: new Date(),
        status: 'Bidding',
      },
    });

    if (!deliveryRequest) {
      return res
          .status(404)
          .json({success: false, message: 'Delivery request not found.'});
    }

    await prisma.bid.create({
      data: {
        driver_id: driverId,
        delivery_request_id: deliveryRequestId,
        bid_price: bidPrice,
      },
    });

    res.json({
      success: true,
      message: 'Bid recorded successfully.',
      requestId: deliveryRequestId,
    });
  } catch (error) {
    console.error('Error recording bid:', error);
    res.status(500).json({success: false, message: 'Internal server error.'});
  }
});

router.post('/update-bid', async (req, res) => {
  const {bidId, newBidPrice, driverId} = req.body;

  try {
    const bid = await prisma.bid.findUnique({
      where: {id: bidId},
    });

    if (!bid) {
      return res.status(404).json({success: false, message: 'Bid not found.'});
    }

    await prisma.bid.update({
      where: {id: bidId},
      data: {
        bid_price: newBidPrice,
        driver_id: driverId,
      },
    });

    await prisma.deliveryRequest.update({
      where: {id: bid.delivery_request_id},
      data: {
        price_offer: newBidPrice,
      },
    });

    res.json({success: true, message: 'Bid updated successfully.'});
  } catch (error) {
    console.error('Error updating bid:', error);
    res.status(500).json({success: false, message: 'Internal server error.'});
  }
});

router.post('/record-winning-bid', async (req, res) => {
  const {bidId} = req.body;

  try {
    const updatedBid = await prisma.bid.update({
      where: {id: bidId},
      data: {status: 'Bidding'},
    });

    if (!updatedBid) {
      return res.status(404).json({success: false, message: 'Bid not found.'});
    }

    await prisma.deliveryRequest.update({
      where: {id: updatedBid.delivery_request_id},
      data: {status: 'Bidding'},
    });

    res.json({success: true, message: 'Winning bid recorded successfully.'});
  } catch (error) {
    console.error('Error recording winning bid:', error);
    res.status(500).json({success: false, message: 'Internal server error.'});
  }
});

cron.schedule('* * * * *', async () => {
  try {
    // Step 1: Fetch eligible bids
    const bidsToUpdate = await prisma.bid.findMany({
      where: {
        status: 'Bidding',
        bid_time: {
          lt: new Date(Date.now() - 5 * 60000),
        },
        delivery_requests: {
          status: 'Bidding',
        },
      },
      include: {
        delivery_requests: true,
      },
    });

    // Step 2: Update fetched bids status to 'Sold'
    for (const bid of bidsToUpdate) {
      await prisma.bid.update({
        where: {id: bid.id},
        data: {status: 'Sold'},
      });
    }

    // Step 3: Process each bid
    for (const bid of bidsToUpdate) {
      // Check if a winning bid already exists
      const existingWinningBid = await prisma.winningBid.findUnique({
        where: {
          delivery_request_id: bid.delivery_request_id,
        },
      });

      // If no winning bid exists, insert a new one
      if (!existingWinningBid) {
        await prisma.winningBid
            .create({
              data: {
                bid_id: bid.id,
                delivery_request_id: bid.delivery_request_id,
              },
            })
            .catch((error) => {
              console.error('Error inserting winning bid:', error);
            });
      }

      // Update corresponding delivery request status to 'Sold'
      await prisma.deliveryRequest.update({
        where: {id: bid.delivery_request_id},
        data: {status: 'Sold'},
      });
    }
  } catch (error) {
    console.error('Error in CRON job:', error);
  }
});

module.exports = router;
