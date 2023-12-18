const cron = require("node-cron");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const runCronJob = () => {
    // Schedule a task to check bids every minute
    cron.schedule("* * * * *", async () => {
        try {
            // Step 1: Find Delivery Requests in 'Bidding' status and check the timer
            const deliveryRequests = await prisma.deliveryRequest.findMany({
                where: {
                    status: "Bidding",
                    bid_end_time: {
                        lt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
                    },
                },
                include: {
                    Bids: true,
                },
            });

            // Step 2: Process each delivery request
            for (const deliveryRequest of deliveryRequests) {
                // Find the bid that matches the delivery request's price_offer
                const matchingBid = deliveryRequest.bidhistory.find(bid => bid.bid_price === deliveryRequest.price_offer);

                if (matchingBid) {
                    // Step 3: Mark the matching bid as 'Sold'
                    await prisma.bid.update({
                        where: { id: matchingBid.id },
                        data: { status: "Sold" },
                    });

                    // Step 4: Mark the delivery request as 'Sold'
                    await prisma.deliveryRequest.update({
                        where: { id: deliveryRequest.id },
                        data: { status: "Sold" },
                    });

                    // Step 5: Prompt the winning driver to accept the request
                    // If the Prompt is accepted
                    // If the prompt is not accepted, find next lowest bid and contact this driver
                    // loop this function until there are no drivers left
                }
            }
        } catch (error) {
            console.error("Error in CRON job:", error);
        }
    });
};


module.exports = runCronJob;
