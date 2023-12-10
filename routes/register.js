const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const cors = require('cors');
const {PrismaClient} = require('@prisma/client');
const Cognito = require('../classes/cognito');

const prisma = new PrismaClient();
const cognito = new Cognito();

router.use(cors());

router.post('/sign-up', async (req, res) => {
  try {
    const {firstName, lastName, email, password, role} = req.body;

    if (
      !email ||
      !password ||
      !role ||
      (role === 'Customer' && (!firstName || !lastName))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request: Missing required fields',
      });
    }

    if (role !== 'Driver' && role !== 'Customer') {
      return res
          .status(400)
          .json({success: false, message: 'Bad Request: Invalid role'});
    }

    const userExists = await cognito.doesUserExist(email);
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: Email already exists in Cognito',
      });
    }

    const cognitoResponse = await cognito.signUp(email, password);

    const cognitoId = cognitoResponse.UserSub;

    // Todo: Remove later when adding a confirmation for registration
    await cognito.adminConfirmSignUp(email);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        role: role,
        cognitoId: cognitoId,
      },
    });

    if (role === 'Driver') {
      await prisma.driver.create({data: {user_id: newUser.id}});
    } else {
      await prisma.customer.create({
        data: {
          user_id: newUser.id,
          first_name: firstName,
          last_name: lastName,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: newUser.id,
      role,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res
          .status(409)
          .json({success: false, message: 'Conflict: Email already exists'});
    }
    console.error('Error during registration:', error);
    return res
        .status(500)
        .json({success: false, message: 'Internal Server Error'});
  }
});

module.exports = router;
