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

    res.json(acceptedBids);
  } catch (error) {
    console.error('Error fetching accepted bids:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  module.exports = router;