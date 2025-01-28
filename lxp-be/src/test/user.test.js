import supertest from "supertest";
import { web } from "../application/web.js";
import { prismaClient } from "../application/database.js";
import { logger } from "../application/logging.js";
import { createTestUser, removeTestUser } from "./test.util.js";

describe("POST /api/users", function () {
  afterEach(async () => {
    await removeTestUser();
  });

  it("should can register new user", async () => {
    const result = await supertest(web).post("/api/users").send({
      name: "test",
      email: "test@gmail.com",
      password: "password",
    });

    expect(result.status).toBe(201); // Should be 201 for resource creation
    expect(result.body.data.name).toBe("test");
    expect(result.body.data.email).toBe("test@gmail.com");
    expect(result.body.data.password).toBeUndefined();
  });

  it("should reject if request is invalid", async () => {
    const result = await supertest(web).post("/api/users").send({
      email: "",
      password: "",
      name: "",
    });

    logger.info(result.body);
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should reject if username already exists", async () => {
    // First registration
    let result = await supertest(web).post("/api/users").send({
      name: "test",
      email: "test@gmail.com",
      password: "password",
    });

    expect(result.status).toBe(201); // Changed to 201 for resource creation
    expect(result.body.data.name).toBe("test");
    expect(result.body.data.email).toBe("test@gmail.com");
    expect(result.body.data.password).toBeUndefined();

    // Second registration with same email
    result = await supertest(web).post("/api/users").send({
      name: "test",
      email: "test@gmail.com",
      password: "password",
    });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
});

describe("POST /api/users/login", function () {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it("Should can login", async () => {
    const result = await supertest(web).post("/api/users/login").send({
      email: "test@gmail.com",
      password: "password",
    });

    logger.info(result.body);

    expect(result.status).toBe(200);
    expect(result.body.data.token).toBeDefined();
    expect(result.body.data.token).not.toBe("test");
  });

  it("Should reject login if request is invalid", async () => {
    const result = await supertest(web).post("/api/users/login").send({
      email: "",
      password: "",
    });

    logger.info(result.body);

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("Should reject login if password is wrong", async () => {
    const result = await supertest(web).post("/api/users/login").send({
      email: "test@gmail.com",
      password: "password123",
    });

    logger.info(result.body);

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });

  it("Should reject login if username is wrong", async () => {
    const result = await supertest(web).post("/api/users/login").send({
      email: "tes@gmail.com",
      password: "password",
    });

    logger.info(result.body);

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});
