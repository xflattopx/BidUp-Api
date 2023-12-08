const express = require('express');
const router = express.Router();
const cors = require('cors');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.use(cors());

router.post('/sign-up', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;

        if (!email || !password || !role || (role === 'Customer' && (!first_name || !last_name))) {
            return res.status(400).json({ success: false, message: "Bad Request: Missing required fields" });
        }

        if (role !== 'Driver' && role !== 'Customer') {
            return res.status(400).json({ success: false, message: "Bad Request: Invalid role" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                role: role,
            },
        });

        if (role === 'Driver') {
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

        return res.status(201).json({ success: true, message: "User registered successfully", userId: newUser.id, role });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "Conflict: Email already exists" });
        }
        console.error('Error during registration:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


module.exports = router;
