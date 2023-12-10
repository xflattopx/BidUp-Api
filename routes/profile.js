const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const cors = require('cors');
const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
router.use(cors());

router.get('/profile-request-details', async (req, res) => {
  try {
    const customerId = parseInt(req.query.customerId);
    if (isNaN(customerId)) {
      return res
          .status(400)
          .json({success: false, error: 'Invalid customerId'});
    }

    const user = await prisma.user.findUnique({
      where: {id: customerId},
      include: {
        DeliveryRequests: {
          select: {
            id: true,
            pickup_location: true,
            dropoff_location: true,
            description: true,
            preferred_delivery_time: true,
            price_offer: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return res
          .status(404)
          .json({success: false, error: 'Customer not found'});
    }

    res.json({success: true, data: user.DeliveryRequests});
  } catch (error) {
    console.error('Error fetching customer request history:', error);
    res.status(500).json({success: false, error: 'Internal Server Error'});
  }
});

router.get('/profile-personal-details', async (req, res) => {
  try {
    const customerId = parseInt(req.query.customerId);
    if (isNaN(customerId)) {
      return res
          .status(400)
          .json({success: false, error: 'Invalid customerId'});
    }

    const customerProfile = await prisma.customer.findUnique({
      where: {user_id: customerId},
      select: {
        first_name: true,
        last_name: true,
        User: {
          select: {email: true},
        },
      },
    });

    if (!customerProfile) {
      return res
          .status(404)
          .json({success: false, error: 'Customer not found'});
    }

    // Combine customer details with email
    const response = {
      first_name: customerProfile.first_name,
      last_name: customerProfile.last_name,
      email: customerProfile.User.email,
    };

    res.json({success: true, customerProfile: response});
  } catch (error) {
    console.error('Error fetching customer profile details:', error);
    res.status(500).json({success: false, error: 'Internal Server Error'});
  }
});

router.post('/cancel-request', async (req, res) => {
  try {
    const requestId = parseInt(req.body.requestId);
    if (isNaN(requestId)) {
      return res
          .status(400)
          .json({success: false, error: 'Invalid requestId'});
    }

    const updatedRequest = await prisma.deliveryRequest.update({
      where: {id: requestId},
      data: {status: 'Canceled'},
      select: {
        id: true,
        pickup_location: true,
        dropoff_location: true,
        description: true,
        preferred_delivery_time: true,
        price_offer: true,
        status: true,
      },
    });

    if (updatedRequest) {
      res.json({success: true, data: updatedRequest});
    } else {
      res.status(404).json({success: false, error: 'Request not found'});
    }
  } catch (error) {
    console.error('Error canceling request:', error);
    res.status(500).json({success: false, error: 'Internal Server Error'});
  }
});

module.exports = router;
