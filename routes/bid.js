const express = require('express');
const router = express.Router();
const cors = require('cors');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(cors());

router.get('/accepted-bids', async (req, res) => {
  try {
    const { userId } = req.query;

    const acceptedBids = await prisma.deliveryRequest.findMany({
      where: {
        Bids: {
          some: {
            status: 'Sold',
            Driver: {
              user_id: parseInt(userId)
            }
          }
        },
        WinningBid: {
          isNot: null
        }
      },
      select: {
        id: true,
        pickup_location: true,
        dropoff_location: true,
        description: true,
        price_offer: true
      }
    });

    // Format the response to match the expected structure in the frontend
    const formattedBids = acceptedBids.map(bid => ({
      delivery_request_id: bid.id,
      pickup_location: bid.pickup_location,
      dropoff_location: bid.dropoff_location,
      description: bid.description,
      price_offer: bid.price_offer
    }));

    res.json(formattedBids);
  } catch (error) {
    console.error('Error fetching accepted bids:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { deliveryRequestId, driverId, bidPrice } = req.body;

  try {
    const deliveryRequest = await prisma.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: {
        bid_end_time: new Date(),
        status: 'Bidding',
        price_offer: bidPrice
      }
    });

    if (!deliveryRequest) {
      // Need to cover error 404
      return res.status(404).json({ success: false, message: 'Delivery request not found.' });
    }

    await prisma.bid.create({
      data: {
        driver_id: driverId,
        delivery_request_id: deliveryRequestId,
        bid_price: bidPrice,
        status: 'Bidding'
      }
    });

    res.json({ success: true, message: 'Bid recorded successfully.', requestId: deliveryRequestId });
  } catch (error) {
    // Need to cover error 500
    console.error('Error recording bid:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.put('/', async (req, res) => {
  const { bidId, newBidPrice, driverId } = req.body;

  try {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId }
    });

    if (!bid) {
      // Need to cover error 404
      return res.status(404).json({ success: false, message: 'Bid not found.' });
    }

    await prisma.bid.update({
      where: { id: bidId },
      data: {
        bid_price: newBidPrice,
        driver_id: driverId
      }
    });

    await prisma.deliveryRequest.update({
      where: { id: bid.delivery_request_id },
      data: {
        price_offer: newBidPrice
      }
    });
    
    res.json({ success: true, message: 'Bid updated successfully.' });
  } catch (error) {
    // Need to cover Error 500
    console.error('Error updating bid:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


module.exports = router;