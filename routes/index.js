// Example: customer_request.js
const express = require('express');
const router = express.Router();

// Define routes for /customer_request
router.get('/', (req, res) => {
  // Your route logic here
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);

});

module.exports = router;
