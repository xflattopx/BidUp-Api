const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.use(cors());
router.use(express.json());

router.post('/get-user', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (user && await bcrypt.compare(password, user.password)) {
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                // Add any additional role-specific information here
            };

            const secretKey = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
            const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1800s' });

            res.status(200).json({ token, role: user.role, user_id: user.id, email });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
