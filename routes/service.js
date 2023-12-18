var express = require('express');
var router = express.Router();
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
router.use(cors());

router.post('/', async function (req, res) {
  var requestData = req.body;

  if (!requestData.pickupLocation || !requestData.dropOffLocation || !requestData.description || !requestData.preferredDeliveryTime || requestData.priceOffer === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Fix Later - @Frontend Change Required
  const priceOffer = parseFloat(requestData.priceOffer);

  // Todo: @Frontend Task - Change request for customer_id to user_id
  // const customer = await prisma.customer.findFirst({
  //   where: {
  //     user_id: requestData.customerId
  //   }
  // })

  try {
      const newDeliveryRequest = await prisma.deliveryRequest.create({
          data: {
              pickup_location: requestData.pickupLocation,
              dropoff_location: requestData.dropOffLocation,
              description: requestData.description,
              preferred_delivery_time: new Date(requestData.preferredDeliveryTime),
              price_offer: priceOffer,
              initial_price_offer: priceOffer,
              user_id: requestData.customerId
          },
      });

      return res.json(newDeliveryRequest);
  } catch (err) {
      console.error('Error storing data:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/', async function (req, res) {
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

router.put('/cancel', async (req, res) => {
  try {
    const requestId = parseInt(req.body.requestId);
    
    if (isNaN(requestId)) {
      return res.status(400).json({ success: false, error: 'Invalid requestId' });
    }

    const updatedRequest = await prisma.deliveryRequest.update({
      where: { id: requestId },
      data: { status: 'Canceled' },
      select: {
        id: true,
        pickup_location: true,
        dropoff_location: true,
        description: true,
        preferred_delivery_time: true,
        price_offer: true,
        status: true
      }
    });

    if (updatedRequest) {
      res.json({ success: true, data: updatedRequest });
    } else {
      res.status(404).json({ success: false, error: 'Request not found' });
    }
  } catch (error) {
    console.error('Error canceling request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/request-history', async (req, res) => {
  try {
    const customerId = parseInt(req.query.customerId);
    if (isNaN(customerId)) {
      return res.status(400).json({ success: false, error: 'Invalid customerId' });
    }

    const user = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        DeliveryRequests: {
          select: {
            id: true,
            pickup_location: true,
            dropoff_location: true,
            description: true,
            preferred_delivery_time: true,
            price_offer: true,
            status: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: user.DeliveryRequests });
  } catch (error) {
    console.error('Error fetching customer request history:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


module.exports = router;