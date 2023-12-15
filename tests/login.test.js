const supertest = require("supertest");
const app = require("../app");
const { PrismaClient } = require("@prisma/client");

jest.mock('../classes/cognito', () => {
  return jest.fn().mockImplementation(() => ({
    signIn: jest.fn((email, password) => {
      if (email === 'valid@example.com' && password === 'validPassword') {
        return Promise.resolve({
          AuthenticationResult: {
            AccessToken: 'validAccessToken'
          }
        });
      } else {
        return Promise.reject(new Error('Invalid credentials'));
      }
    }),
  }));
});

jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn((query) => {
          if (query.where.email === 'valid@example.com') {
            return Promise.resolve({ id: 1, email: 'valid@example.com', role: 'Customer' });
          } else {
            return Promise.resolve(null);
          }
        })
      }
    })),
  };
});

let server, request;

describe("/auth/get-user API", () => {
  beforeAll(() => {
    server = app.listen();
    request = supertest(server);
  });

  afterAll(() => {
    server.close();
  });

  it("should successfully authenticate and return user data", async () => {
    const mockLoginData = {
      email: "valid@example.com",
      password: "validPassword",
    };

    const response = await request.post("/auth/get-user").send(mockLoginData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("role", "Customer");
  });
});
