const supertest = require("supertest");
const app = require("../app"); // Ensure this path correctly points to your Express app
const { PrismaClient } = require("@prisma/client");

// Mock the Prisma client
jest.mock("@prisma/client", () => {
  const mockDeliveryRequest = {
    id: 1,
    pickup_location: "pick up location",
    dropoff_location: "dropoff location",
    description: "a place",
    status: "Pending"
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
        findUnique: jest.fn().mockResolvedValue(mockBid),
        update: jest.fn().mockResolvedValue({ ...mockBid, bid_price: 200 }),
      },
    })),
  };
});

let server, request;

describe("Record a Bid", () => {
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

    const response = await request.post("/bid/").send(mockBidRequest);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Bid recorded successfully.");
  });
});

describe("Update a bid", () => {
  it("should update a bid successfully", async () => {
    const mockBidUpdateRequest = {
      bidId: 1,
      newBidPrice: 200,
      driverId: 1,
    };

    const response = await request
      .put("/bid/")
      .send(mockBidUpdateRequest);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Bid updated successfully.");
  });
});

describe("/record-winning-bid", () => {
  it("should update a bid successfully", async () => {
    const mockBidUpdateRequest = {
      bidId: 1,
      newBidPrice: 200,
      driverId: 1,
    };

    const response = await request
      .post("/bid/record-winning-bid")
      .send(mockBidUpdateRequest);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Winning bid recorded successfully.");
  });
});
