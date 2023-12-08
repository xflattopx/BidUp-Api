const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Define the user details
  const userDetails = [
    {
      email: 'driver@example.com',
      password: 'password123',
      role: 'Driver'
    },
    {
      email: 'customer@example.com',
      password: 'password123',
      role: 'Customer',
      first_name: 'John',
      last_name: 'Doe'
    }
  ];

  for (const user of userDetails) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    if (user.role === 'Driver') {
      await prisma.driver.create({ 
        data: { 
            user_id: newUser.id
        } 
    });
    } else {
      await prisma.customer.create({
        data: {
          user_id: newUser.id,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
