const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function getUpdatedQueue() {
  try {
    return await prisma.deliveryRequest.findMany({
      where: {
        status: {
          in: ['Pending', 'Bidding'],
        },
      },
    });
  } catch (error) {
    console.error('Error fetching updated queue:', error);
    throw error;
  }
}

async function getProfileRequestDetails(customerId) {
  try {
    return await prisma.deliveryRequest.findMany({
      where: {
        customer: {
          id: customerId,
        },
      },
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
  } catch (error) {
    console.error('Error fetching profile request details:', error);
    throw error;
  }
}

module.exports = {
  getUpdatedQueue,
  getProfileRequestDetails,
};
