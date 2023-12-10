const {PrismaClient} = require('@prisma/client');
const Cognito = require('../classes/cognito'); // Adjust the path as needed
const prisma = new PrismaClient();
const cognito = new Cognito(); // Instantiate the Cognito class

function generateRandomUserDetails() {
  const timestamp = Date.now();
  return [
    {
      email: `driver${timestamp}@example.com`,
      password: 'Assword123!',
      role: 'Driver',
    },
    {
      email: `customer${timestamp}@example.com`,
      password: 'Assword123!',
      role: 'Customer',
      first_name: 'John',
      last_name: 'Doe',
    },
  ];
}

async function main() {
  const userDetails = generateRandomUserDetails();

  for (const user of userDetails) {
    try {
      // Create user in AWS Cognito
      const cognitoResponse = await cognito.signUp(user.email, user.password);
      const cognitoId = cognitoResponse.UserSub;
      await cognito.adminConfirmSignUp(user.email);

      // Create user in Prisma with Cognito ID
      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          role: user.role,
          cognitoId: cognitoId,
        },
      });

      if (user.role === 'Driver') {
        await prisma.driver.create({
          data: {
            user_id: newUser.id,
          },
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
    } catch (error) {
      console.error('Error during user creation:', error);
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
