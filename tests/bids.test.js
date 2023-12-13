const supertest = require("supertest");
const app = require("../app"); // Ensure this path correctly points to your Express app
const { PrismaClient } = require("@prisma/client");

// Mock the Prisma client
jest.mock("@prisma/client", () => {
  // Define the mock implementation within the factory function
  const mockDeliveryRequest = {
    id: 1,
    // other properties as per your schema
  };

  const mockBid = {
    id: 1,
    driver_id: 1,
    delivery_request_id: 1,
    bid_price: 100,
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      deliveryRequest: {
        update: jest.fn().mockResolvedValue(mockDeliveryRequest),
      },
      bid: {
        create: jest.fn().mockResolvedValue(mockBid),
      },
    })),
  };
});

describe("/record-bid", () => {
  let server, request;

  beforeAll(() => {
    server = app.listen(); // Start your app on a random free port
    request = supertest(server);
  });

  afterAll(() => {
    server.close(); // Close the server after the tests
  });

  it("should record a bid successfully", async () => {
    const mockBidRequest = {
      deliveryRequestId: 1,
      driverId: 1,
      bidPrice: 100,
    };

    const response = await request.post("/bid/record-bid").send(mockBidRequest);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Bid recorded successfully.");

  });
});

describe('/update-bid', () => {
    it('should update a bid successfully', async () => {
      const mockBidUpdateRequest = {
        bidId: 1,
        newBidPrice: 200,
        driverId: 1
      };
  
      const response = await request.post('/bid/update-bid').send(mockBidUpdateRequest);
  
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Bid updated successfully.');
  
    });
  

  });