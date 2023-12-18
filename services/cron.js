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
                const matchingBid = deliveryRequest.Bids.find(bid => bid.bid_price === deliveryRequest.price_offer);

                if (matchingBid) {
                    // Step 3: Mark the matching bid as 'Sold'
                    await prisma.bid.update({
                        where: { id: matchingBid.id },
                        data: { status: "Sold" },
                    });

                    // Step 4: Update a Winning Bid in the Winning Bids table
                    await prisma.winningBid.create({
                        data: {
                            bid_id: matchingBid.id,
                            delivery_request_id: deliveryRequest.id,
                        },
                    }).catch((error) => {
                        console.error("Error inserting winning bid:", error);
                    });

                    // Step 5: Mark the delivery request as 'Sold'
                    await prisma.deliveryRequest.update({
                        where: { id: deliveryRequest.id },
                        data: { status: "Sold" },
                    });
                }
            }
        } catch (error) {
            console.error("Error in CRON job:", error);
        }
    });
};


module.exports = runCronJob;
