const express = require('express');
const router = express.Router();
const cors = require('cors');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(cors());

router.post('/record-bid', async (req, res) => {
  const { deliveryRequestId, driverId, bidPrice } = req.body;

  try {
    const deliveryRequest = await prisma.deliveryRequest.update({
      where: { id: deliveryRequestId },
      data: {
        bid_end_time: new Date(),
        status: 'Bidding'
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
        bid_price: bidPrice
      }
    });

    res.json({ success: true, message: 'Bid recorded successfully.', requestId: deliveryRequestId });
  } catch (error) {
    // Need to cover error 500
    console.error('Error recording bid:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/update-bid', async (req, res) => {
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

router.post('/record-winning-bid', async (req, res) => {
  const { bidId } = req.body;

  try {
    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'Bidding' }
    });

    if (!updatedBid) {
      // Need to cover error 404
      return res.status(404).json({ success: false, message: 'Bid not found.' });
    }

    await prisma.deliveryRequest.update({
      where: { id: updatedBid.delivery_request_id },
      data: { status: 'Bidding' }
    });

    res.json({ success: true, message: 'Winning bid recorded successfully.' });
  } catch (error) {
    // Need to cover error 500
    console.error('Error recording winning bid:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


module.exports = router;