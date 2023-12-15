const express = require("express");
const router = express.Router();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const Cognito = require("../classes/cognito"); // Import the Cognito class

const prisma = new PrismaClient();
const cognito = new Cognito(); // Instantiate the Cognito class

router.use(cors());

router.post("/sign-up", async (req, res) => {
  let newUser;

  try {
    const { first_name, last_name, email, password, role } = req.body;

    if (
      !email ||
      !password ||
      !role ||
      (role === "Customer" && (!first_name || !last_name))
    ) {
      return res.status(400).json({
        success: false,
        message: "Bad Request: Missing required fields",
      });
    }

    if (role !== "Driver" && role !== "Customer") {
      return res
        .status(400)
        .json({ success: false, message: "Bad Request: Invalid role" });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Conflict: Email already exists in database",
      });
    }

    try {
      // Register user in AWS Cognito
      const cognitoResponse = await cognito.signUp(email, password);
      const cognitoId = cognitoResponse.UserSub;
      await cognito.adminConfirmSignUp(email);

      // Create user in the database with cognitoId
      newUser = await prisma.user.create({
        data: {
          email: email,
          role: role,
          cognitoId: cognitoId, // Storing the Cognito ID
        },
      });

      if (role === "Driver") {
        await prisma.driver.create({ data: { user_id: newUser.id } });
      } else {
        await prisma.customer.create({
          data: {
            user_id: newUser.id,
            first_name: first_name,
            last_name: last_name,
          },
        });
      }
    } catch (error) {
      if (error.code === "UsernameExistsException") {
        return res.status(409).json({
          success: false,
          message: "Conflict: Email already exists in Cognito",
        });
      } else {
        throw error; // re-throw the error for the outer catch block
      }
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: newUser,
      role,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Conflict: Email already exists" });
    }
    console.error("Error during registration:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
