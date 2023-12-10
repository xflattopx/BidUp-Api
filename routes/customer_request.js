var express = require('express');
var router = express.Router();
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
router.use(cors());

router.use(cors());

router.post('/', async function (req, res, next) {
  var requestData = req.body;

  // Validate the required fields
  if (
    !requestData.pickupLocation ||
    !requestData.dropOffLocation ||
    !requestData.description ||
    !requestData.preferredDeliveryTime ||
    requestData.priceOffer === undefined
  ) {
    return res
      .status(400)
      .json({ success: false, error: 'Missing required fields' });
  }

  // Fix Later - @Frontend Change Required
  const priceOffer = parseFloat(requestData.priceOffer);

  try {
    // Use Prisma to insert data
    const newDeliveryRequest = await prisma.deliveryRequest.create({
      data: {
        pickup_location: requestData.pickupLocation,
        dropoff_location: requestData.dropOffLocation,
        description: requestData.description,
        preferred_delivery_time: new Date(requestData.preferredDeliveryTime),
        price_offer: priceOffer,
        user_id: requestData.customerId,
      },
    });

    return res.json(newDeliveryRequest);
  } catch (err) {
    console.error('Error storing data:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/all', async function (req, res, next) {
  try {
    const deliveryRequests = await prisma.deliveryRequest.findMany({
      where: {
        status: {
          notIn: ['Sold', 'Canceled'],
        },
      },
    });

    res.json(deliveryRequests);
  } catch (error) {
    console.error('Error retrieving rows:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
