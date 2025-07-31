const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let waitingUsers = [];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining queue
  socket.on('findPartner', (gender) => {
    socket.gender = gender;

    // Check if someone is waiting
    const partner = waitingUsers.find((user) => user.gender !== gender);

    if (partner) {
      // Pair the users
      waitingUsers = waitingUsers.filter((user) => user.id !== partner.id);
      socket.partner = partner.id;
      partner.partner = socket.id;

      socket.emit('partnerFound', partner.id);
      partner.emit('partnerFound', socket.id);
    } else {
      // Add to waiting queue
      waitingUsers.push(socket);
      socket.emit('waiting');
    }
  });

  // Handle user message
  socket.on('message', (msg) => {
    if (socket.partner) {
      io.to(socket.partner).emit('message', msg);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove from waiting list
    waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);

    if (socket.partner) {
      io.to(socket.partner).emit('partnerDisconnected');
    }
  });

  // Handle user block or report (basic for now)
  socket.on('blockPartner', () => {
    if (socket.partner) {
      io.to(socket.partner).emit('blocked');
      socket.partner = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
