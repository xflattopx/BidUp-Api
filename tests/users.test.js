const supertest = require("supertest");
const app = require("../app"); // Ensure this path correctly points to your Express app
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// Mock Cognito
jest.mock('../classes/cognito', () => {
  return jest.fn().mockImplementation(() => ({
    signUp: jest.fn().mockResolvedValue({ UserSub: "cognitoId" }),
    adminConfirmSignUp: jest.fn().mockResolvedValue(null)
  }));
});

// Mock the Prisma client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        create: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', role: 'Customer' }),
        findUnique: jest.fn().mockResolvedValue(null)
      },
      driver: {
        create: jest.fn().mockResolvedValue(null)
      },
      customer: {
        create: jest.fn().mockResolvedValue(null)
      }
    })),
  };
});

let server, request;

describe("Registration API", () => {
  beforeAll(() => {
    server = app.listen(); // Start your app on a random free port
    request = supertest(server);
  });

  afterAll(() => {
    server.close(); // Close the server after the tests
  });

  describe("/user/sign-up", () => {
    it("should register a user successfully", async () => {
      const mockUserData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "Password123",
        role: "Customer"
      };

      const response = await request.post("/user/sign-up").send(mockUserData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "User registered successfully");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request.post("/user/sign-up").send({ email: "jane@example.com", password: "Password123" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Bad Request: Missing required fields");
    });
  });
});
