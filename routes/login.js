const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const cors = require('cors');
const {PrismaClient} = require('@prisma/client');
const Cognito = require('../classes/cognito'); // Import the Cognito class

const prisma = new PrismaClient();
const cognito = new Cognito(); // Instantiate the Cognito class

router.use(cors());
router.use(express.json());

router.post('/get-user', async (req, res) => {
  const {email, password} = req.body;

  try {
    const authResponse = await cognito.signIn(email, password);

    if (authResponse && authResponse.AuthenticationResult) {
      const token = authResponse.AuthenticationResult.AccessToken;
      const user = await prisma.user.findUnique({
        where: {email: email},
      });

      if (user) {
        res.status(200).json({token, role: user.role, user_id: user.id, email});
      } else {
        res.status(404).json({error: 'User not found'});
      }
    } else {
      res.status(401).json({error: 'Invalid credentials'});
    }
  } catch (error) {
    console.error('Error in user authentication:', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

module.exports = router;
