const socketIo = require('socket.io');
const { getUpdatedQueue, getProfileRequestDetails } = require('./routes/queue_service');
const cors = require('cors');

const attachSocketIO = (server) => {
  const ports = [4200,4201, 4202, 4203, 4204, 4205]; // Hardcoded array of ports

  const ioInstances = ports.map((port) => {
    const io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
    });

    io.listen(port, () => {
      console.log(`Sockets listening on port ${port}`);
    });

    io.on('connection', (socket) => {
      console.log(`A user connected on port ${port}`);

      // Additional Socket.IO event handling can be added here

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    return io;
  });

  async function emitUpdateQueueEvent() {
    try {
      // Get the updated queue from the database
      const updatedQueue = await getUpdatedQueue();

      // Emit the 'updateQueue' event to all connected clients on all instances
      ioInstances.forEach((io) => io.emit('updateQueue', updatedQueue));
    } catch (error) {
      console.error('Error emitting updateQueue event:', error);
      // Handle the error as needed
    }
  }

  async function emitUpdateRequestDetailsEvent(customerId) {
    try {
      const updatedRequestDetails = await getProfileRequestDetails(customerId);

      // Emit the 'updateRequestDetails' event to all connected clients on all instances
      ioInstances.forEach((io) => io.emit('updateRequestDetails', updatedRequestDetails));
    } catch (error) {
      console.error('Error emitting updateRequestDetails event:', error);
      // Handle the error as needed
    }
  }

  return { ioInstances, emitUpdateQueueEvent, emitUpdateRequestDetailsEvent };
};

module.exports = attachSocketIO;
