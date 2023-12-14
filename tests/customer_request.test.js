const supertest = require("supertest");
const app = require("../app"); // Ensure this path correctly points to your Express app
const { PrismaClient } = require("@prisma/client");

// Mock the Prisma client
jest.mock("@prisma/client", () => {
  const mockDeliveryRequest = {
    id: 1,
    pickup_location: "Pickup Location",
    dropoff_location: "Dropoff Location",
    description: "Description",
    preferred_delivery_time: new Date(),
    price_offer: 100,
    status: "Pending",
    user_id: 1,
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      deliveryRequest: {
        create: jest.fn().mockResolvedValue(mockDeliveryRequest),
        findMany: jest.fn().mockResolvedValue([mockDeliveryRequest]),
      },
    })),
  };
});

let server, request;

describe("Delivery Request API", () => {
  beforeAll(() => {
    server = app.listen(); // Start your app on a random free port
    request = supertest(server);
  });

  afterAll(() => {
    server.close(); // Close the server after the tests
  });

  describe("/customer_request/", () => {
    it("should create a delivery request successfully", async () => {
      const mockRequestData = {
        pickupLocation: "Pickup Location",
        dropOffLocation: "Dropoff Location",
        description: "Description",
        preferredDeliveryTime: new Date(),
        priceOffer: 100,
        customerId: 1,
      };

      const response = await request
        .post("/customer_request/")
        .send(mockRequestData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", 1);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request.post("/customer_request/").send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: "Missing required fields",
      });
    });
  });

  describe("/customer_request/all", () => {
    it("should retrieve all delivery requests successfully", async () => {
      const response = await request.get("/customer_request/all");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty("id", 1);
    });
  });
});