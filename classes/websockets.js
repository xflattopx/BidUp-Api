const io = require('socket.io');

class websockets {
    constructor(server) {
        this.io = socketIO(server);
        this.messageQueue = new Map();
        this.initializeWebSocket();
    }

    initializeWebSocket() {
        io.on('connection', async (socket) => {
            const token = socket.handshake.query.token;
            try {
                const userData = await cognito.validateToken(token);
                const driverId = userData.Username;

                this.driverConnections.set(driverId, socket);
                socket.on('disconnect', () => {
                    this.driverConnections.delete(driverId);
                });
            } catch (error) {
                console.error('Authentication error:', error);
                socket.disconnect(true);
            }
        });
    }

    // Add layers of security here
    async authenticateDriver(token) {
        try {
            const params = {
                AccessToken: token
            };
            const response = await cognito.getUser(params).promise();
            // Extract driver ID from Cognito response
            const driverId = response.Username; // or any other identifier
            return driverId;
        } catch (error) {
            console.error('Error validating token:', error);
            return null;
        }
    }

    sendToDriver(driverId, message) {
        const socket = this.driverConnections.get(driverId);
        if (socket) {
            socket.emit('message', message);
            return true; // Message sent successfully
        } else {
            console.error(`No connected driver found for driverId ${driverId}`);
            return false; // No driver to send to
        }
    }
}

module.exports = websockets;
