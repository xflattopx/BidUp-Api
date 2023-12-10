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
              user_id: parseInt(userId),
            },
          },
        },
        WinningBid: {
          isNot: null,
        },
      },
      select: {
        id: true,
        pickup_location: true,
        dropoff_location: true,
        description: true,
        price_offer: true,
      },
    });

    // Format the response to match the expected structure in the frontend
    const formattedBids = acceptedBids.map(bid => ({
      delivery_request_id: bid.id,
      pickup_location: bid.pickup_location,
      dropoff_location: bid.dropoff_location,
      description: bid.description,
      price_offer: bid.price_offer,
    }));

    res.json(formattedBids);
  } catch (error) {
    console.error('Error fetching accepted bids:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
