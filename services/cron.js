const cron = require("node-cron");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const runCronJob = () => {
    // Schedule a task to check bids every minute
    cron.schedule("* * * * *", async () => {
    try {
        // Step 1: Fetch eligible bids
        const bidsToUpdate = await prisma.bid.findMany({
        where: {
            status: "Bidding",
            bid_time: {
            lt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
            },
            delivery_requests: {
            // Corrected relationship field name
            status: "Bidding",
            },
        },
        include: {
            delivery_requests: true, // Corrected relationship field name
        },
        });

        // Step 2: Update fetched bids status to 'Sold'
        for (const bid of bidsToUpdate) {
        await prisma.bid.update({
            where: { id: bid.id },
            data: { status: "Sold" },
        });
        }

        // Step 3: Process each bid
        for (const bid of bidsToUpdate) {
        // Check if a winning bid already exists
        const existingWinningBid = await prisma.winningBid.findUnique({
            where: {
            delivery_request_id: bid.delivery_request_id,
            },
        });

        // If no winning bid exists, insert a new one
        if (!existingWinningBid) {
            await prisma.winningBid
            .create({
                data: {
                bid_id: bid.id, // Assuming this is the correct field name
                delivery_request_id: bid.delivery_request_id,
                },
            })
            .catch((error) => {
                // Handle any other errors
                console.error("Error inserting winning bid:", error);
            });
        }

        // Update corresponding delivery request status to 'Sold'
        await prisma.deliveryRequest.update({
            where: { id: bid.delivery_request_id },
            data: { status: "Sold" },
        });
        }
    } catch (error) {
        console.error("Error in CRON job:", error);
    }
    });
}

module.exports = runCronJob;
