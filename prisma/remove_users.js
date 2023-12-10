const { PrismaClient } = require('@prisma/client');
const Cognito = require('../classes/cognito'); // Adjust the path as needed

const prisma = new PrismaClient();
const cognito = new Cognito();

async function deleteAllUsers() {
  try {
    const users = await prisma.user.findMany();

    for (let user of users) {
      try {
        // Delete user from AWS Cognito
        await cognito.removeUser(user.email);
        console.log(`Deleted user from Cognito: ${user.email}`);

        // Delete dependent records in related tables
        // Example for the 'Driver' table
        await prisma.driver.deleteMany({
          where: { user_id: user.id },
        });

        // Example for the 'Customer' table
        await prisma.customer.deleteMany({
          where: { user_id: user.id },
        });

        // Add similar deletion logic for other related tables like 'DeliveryRequest', etc.

        // Delete user from the database
        await prisma.user.delete({
          where: { id: user.id },
        });
        console.log(`Deleted user from database: ${user.email}`);
      } catch (error) {
        console.error(`Error deleting user ${user.email}:`, error);
      }
    }

    console.log('All users deleted');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
