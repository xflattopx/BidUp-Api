const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const websockets = require('../classes/websockets');

// notifyDriver function revised for WebSocket integration
const notifyDriver = async (driverId) => {
    try {
        console.log("Sending Websocket");
        websockets.sendToDriver(driverId, { type: 'newDeliveryRequest', content: 'You have a new delivery job!' });

        return new Promise((resolve, reject) => {
            const responseTimeout = setTimeout(() => {
                reject(new Error('Response timeout'));
            }, 30000);

            websockets.once('responseFromDriver', (driverResponse) => {
                clearTimeout(responseTimeout);
                if (driverResponse.driverId === driverId && driverResponse.type === 'deliveryRequestResponse') {
                    resolve(driverResponse.accepted);
                }
            });

            websockets.on('error', (error) => {
                reject(error);
            });
        });
    } catch (error) {
        console.error(`Error in notifying driver ${driverId}: ${error.message}`);
        return false;
    }
};

// Main cron job function
const runCronJob = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const deliveryRequests = await prisma.deliveryRequest.findMany({
                where: {
                    status: "Bidding",
                    bid_end_time: {
                        lt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
                    },
                },
                include: {
                    Bids: {
                        include: {
                            Driver: true
                        }
                    },
                },
            });

            for (const deliveryRequest of deliveryRequests) {
                const sortedBids = deliveryRequest.Bids.sort((a, b) => a.bid_price - b.bid_price);

                for (const bid of sortedBids) {
                    if (bid.Driver) {
                        const isAccepted = await notifyDriver(bid.Driver.id);
                        if (isAccepted) {
                            await prisma.bid.update({
                                where: { id: bid.id },
                                data: { status: "Accepted" },
                            });
                            await prisma.deliveryRequest.update({
                                where: { id: deliveryRequest.id },
                                data: { status: "Accepted" },
                            });
                            break; // Exit the loop once a driver accepts
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in CRON job:", error);
        }
    });
};

module.exports = runCronJob;
