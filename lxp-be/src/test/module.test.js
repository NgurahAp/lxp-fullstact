import supertest from "supertest";
import { prismaClient } from "../application/database.js";
import { web } from "../application/web.js";
import path from "path";
import fs from "fs";
import {
  createMeeting,
  createModule,
  createTestInstructor,
  createTestUser,
  createTraining,
  createTrainingUser,
  removeAll,
  removeTestInstructor,
  removeTestUser,
} from "./test.util.js";

describe("POST /api/meetings/:meetingId/modules", () => {
  beforeEach(async () => {
    // Create test directories if they don't exist
    const moduleDir = path.join(process.cwd(), "public", "modules");
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    // Create test PDF file
    const testPdfDir = path.join(__dirname, "files");
    if (!fs.existsSync(testPdfDir)) {
      fs.mkdirSync(testPdfDir, { recursive: true });
    }

    const testPdfPath = path.join(testPdfDir, "test.pdf");
    if (!fs.existsSync(testPdfPath)) {
      // Create a simple PDF file for testing
      fs.writeFileSync(testPdfPath, "Test PDF content");
    }

    // Create a non-PDF file for testing
    const testTxtPath = path.join(testPdfDir, "test.txt");
    if (!fs.existsSync(testTxtPath)) {
      fs.writeFileSync(testTxtPath, "Test TXT content");
    }

    await createTestUser();
    await createTestInstructor();

    const instructor = await prismaClient.user.findFirst({
      where: { email: "instructor@test.com" },
    });

    await createTraining(instructor.id);

    const training = await prismaClient.training.findFirst({
      where: { title: "test training" },
    });

    await prismaClient.meeting.create({
      data: {
        trainingId: training.id,
        title: "Test Meeting",
        meetingDate: new Date(),
      },
    });
  });

  afterEach(async () => {
    const moduleDir = path.join(process.cwd(), "public", "modules");

    if (fs.existsSync(moduleDir)) {
      const files = fs.readdirSync(moduleDir);
      files.forEach((file) => {
        fs.unlinkSync(path.join(moduleDir, file));
      });
    }

    await prismaClient.module.deleteMany({});
    await prismaClient.meeting.deleteMany({});
    await prismaClient.training.deleteMany({});
    await removeTestUser();
    await removeTestInstructor();
  });

  it("Should create new module", async () => {
    const meeting = await prismaClient.meeting.findFirst({
      where: { title: "Test Meeting" },
    });

    const testPdfPath = path.join(__dirname, "files", "test.pdf");

    const result = await supertest(web)
      .post(`/api/meetings/${meeting.id}/modules`)
      .set("Authorization", "Bearer test-instructor")
      .field("title", "Test Module")
      .field("moduleScore", "100")
      .attach("content", testPdfPath);

    // Tambahkan ini untuk debugging
    if (result.status !== 200) {
      console.log("Error response:", result.body);
      console.log("Status:", result.status);
    }

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
    expect(result.body.data.title).toBe("Test Module");
    expect(result.body.data.content).toBeDefined();
    expect(result.body.data.content).toMatch(/^modules\/.+.pdf$/);
  });

  it("Should reject non-PDF files", async () => {
    const meeting = await prismaClient.meeting.findFirst({
      where: { title: "Test Meeting" },
    });

    const testTxtPath = path.join(__dirname, "files", "test.txt");

    const result = await supertest(web)
      .post(`/api/meetings/${meeting.id}/modules`)
      .set("Authorization", "Bearer test-instructor")
      .field("title", "Test Module")
      .field("moduleScore", "100") // Convert to string
      .attach("content", testTxtPath);

    expect(result.status).toBe(400);
  });

  it("Should reject if no file is uploaded", async () => {
    const meeting = await prismaClient.meeting.findFirst({
      where: { title: "Test Meeting" },
    });

    const result = await supertest(web)
      .post(`/api/meetings/${meeting.id}/modules`)
      .set("Authorization", "Bearer test-instructor")
      .field("title", "Test Module")
      .field("moduleScore", "100"); // Convert to string

    expect(result.status).toBe(400);
  });
});

describe("POST /api/modules/:moduleId/answer", () => {
  beforeEach(async () => {
    // Create test user and instructor
    await createTestUser();
    await createTestInstructor();

    // Get instructor
    const instructor = await prismaClient.user.findFirst({
      where: { email: "instructor@test.com" },
    });

    // Create training
    const training = await createTraining(instructor.id);

    // Create training user enrollment
    const user = await prismaClient.user.findFirst({
      where: { email: "test@gmail.com" },
    });
    await createTrainingUser(training.id, user.id);

    // Create meeting and module
    const meeting = await createMeeting(training.id);
    await createModule(meeting.id);
  });

  afterEach(async () => {
    await removeAll();
  });

  it("Should submit module answer successfully", async () => {
    const module = await prismaClient.module.findFirst({
      where: { title: "Test Module" },
    });

    const result = await supertest(web)
      .post(`/api/modules/${module.id}/answer`)
      .set("Authorization", "Bearer test")
      .send({
        moduleAnswer: "This is my answer to the module",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.moduleAnswer).toBe(
      "This is my answer to the module"
    );
  });

  it("Should reject if user is not enrolled", async () => {
    // Create a new training with module but without enrollment
    const instructor = await prismaClient.user.findFirst({
      where: { email: "instructor@test.com" },
    });
    const training = await createTraining(instructor.id);
    const meeting = await createMeeting(training.id);
    const module = await createModule(meeting.id);

    const result = await supertest(web)
      .post(`/api/modules/${module.id}/answer`)
      .set("Authorization", "Bearer test")
      .send({
        moduleAnswer: "This is my answer to the module",
      });

    expect(result.status).toBe(404);
  });

  it("Should reject invalid module ID", async () => {
    const result = await supertest(web)
      .post(`/api/modules/999999/answer`)
      .set("Authorization", "Bearer test")
      .send({
        moduleAnswer: "This is my answer to the module",
      });

    expect(result.status).toBe(404);
  });
});

describe("GET /api/meetings/:meetingId/modules", () => {
  beforeEach(async () => {
    // Create test user and instructor
    await createTestUser();
    await createTestInstructor();

    // Get instructor
    const instructor = await prismaClient.user.findFirst({
      where: { email: "instructor@test.com" },
    });

    // Create training
    const training = await createTraining(instructor.id);

    // Create training user enrollment
    const user = await prismaClient.user.findFirst({
      where: { email: "test@gmail.com" },
    });
    await createTrainingUser(training.id, user.id);

    // Create meeting and modules
    const meeting = await createMeeting(training.id);
    await createModule(meeting.id);
    await createModule(meeting.id); // Create multiple modules for pagination testing
  });

  afterEach(async () => {
    await removeAll();
  });

  it("Should get list of modules successfully with pagination", async () => {
    const meeting = await prismaClient.meeting.findFirst({
      where: { title: "Test Meeting" },
    });

    const result = await supertest(web)
      .get(`/api/meetings/${meeting.id}/modules?page=1&size=10`)
      .set("Authorization", "Bearer test");

    if (result.status !== 200) {
      console.log("Error response:", result.body);
      console.log("Status:", result.status);
    }

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
    expect(result.body.data.length).toBeGreaterThan(0);
    expect(result.body.paging).toBeDefined();
    expect(result.body.paging.page).toBe(1);
    expect(result.body.paging.total_page).toBeGreaterThan(0);
  });

  it("Should reject if user is not enrolled", async () => {
    // Create a new training with module but without enrollment
    const instructor = await prismaClient.user.findFirst({
      where: { email: "instructor@test.com" },
    });
    const training = await createTraining(instructor.id);
    const meeting = await createMeeting(training.id);
    await createModule(meeting.id);

    const result = await supertest(web)
      .get(`/api/meetings/${meeting.id}/modules`)
      .set("Authorization", "Bearer test");

    expect(result.status).toBe(404);
  });

  it("Should reject invalid meeting ID", async () => {
    const result = await supertest(web)
      .get(`/api/meetings/999999/modules`)
      .set("Authorization", "Bearer test");

    expect(result.status).toBe(404);
  });
});

describe("GET /api/meetings/:meetingId/modules/:moduleId", () => {
  beforeEach(async () => {
    await createTestUser();
    await createTestInstructor();

    const instructor = await prismaClient.user.findFirst({
      where: { email: "instructor@test.com" },
    });

    const training = await createTraining(instructor.id);

    const user = await prismaClient.user.findFirst({
      where: { email: "test@gmail.com" },
    });
    await createTrainingUser(training.id, user.id);

    const meeting = await createMeeting(training.id);
    await createModule(meeting.id);
  });

  afterEach(async () => {
    await removeAll();
  });

  it("Should get module detail successfully", async () => {
    const meeting = await prismaClient.meeting.findFirst({
      where: { title: "Test Meeting" },
    });

    const module = await prismaClient.module.findFirst({
      where: { title: "Test Module" },
    });

    const result = await supertest(web)
      .get(`/api/meetings/${meeting.id}/modules/${module.id}`)
      .set("Authorization", "Bearer test");

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
    expect(result.body.data.id).toBe(module.id);
    expect(result.body.data.title).toBe(module.title);
  });

  it("Should reject if user is not enrolled", async () => {
    const instructor = await prismaClient.user.findFirst({
      where: { email: "instructor@test.com" },
    });
    const training = await createTraining(instructor.id);
    const meeting = await createMeeting(training.id);
    const module = await createModule(meeting.id);

    const result = await supertest(web)
      .get(`/api/meetings/${meeting.id}/modules/${module.id}`)
      .set("Authorization", "Bearer test");

    expect(result.status).toBe(404);
  });
});

describe("POST /api/modules/:moduleId/score", () => {
  beforeEach(async () => {
    await createTestUser();
    await createTestInstructor();

    const instructor = await prismaClient.user.findFirst({
      where: { email: "instructor@test.com" },
    });

    const training = await createTraining(instructor.id);

    const user = await prismaClient.user.findFirst({
      where: { email: "test@gmail.com" },
    });
    const trainingUser = await createTrainingUser(training.id, user.id);

    const meeting = await createMeeting(training.id);
    await createModule(meeting.id);

    // Initialize score for the user
    await prismaClient.score.create({
      data: {
        trainingUserId: trainingUser.id,
        meetingId: meeting.id,
        moduleScore: 0,
        quizScore: 0,
        taskScore: 0,
        totalScore: 0,
      },
    });
  });

  afterEach(async () => {
    await removeAll();
  });

  it("Should submit module score and update score table successfully", async () => {
    const module = await prismaClient.module.findFirst({
      where: { title: "Test Module" },
    });

    const result = await supertest(web)
      .post(`/api/modules/${module.id}/score`)
      .set("Authorization", "Bearer test-instructor")
      .send({
        moduleScore: 80,
      });

    expect(result.status).toBe(200);
    expect(result.body.data.moduleScore).toBe(80);

    // Verify score table was updated
    const score = await prismaClient.score.findFirst({
      where: {
        meetingId: module.meetingId,
      },
    });

    console.log(score.body)

    expect(score.moduleScore).toBe(80);
    expect(score.totalScore).toBe(80); // Since quiz and task scores are 0
  });

  it("Should reject if module score is string", async () => {
    const module = await prismaClient.module.findFirst({
      where: { title: "Test Module" },
    });

    const result = await supertest(web)
      .post(`/api/modules/${module.id}/score`)
      .set("Authorization", "Bearer test-instructor")
      .send({
        moduleScore: "test",
      });

    expect(result.status).toBe(400);
  });

  it("Should reject invalid module ID", async () => {
    const result = await supertest(web)
      .post(`/api/modules/999999/score`)
      .set("Authorization", "Bearer test-instructor")
      .send({
        moduleScore: 80,
      });

    expect(result.status).toBe(404);
  });

  it("Should update total score correctly when other scores exist", async () => {
    const module = await prismaClient.module.findFirst({
      where: { title: "Test Module" },
    });

    // First set some quiz and task scores
    await prismaClient.score.updateMany({
      where: {
        meetingId: module.meetingId,
      },
      data: {
        quizScore: 90,
        taskScore: 85,
        totalScore: 175,
      },
    });

    const result = await supertest(web)
      .post(`/api/modules/${module.id}/score`)
      .set("Authorization", "Bearer test-instructor")
      .send({
        moduleScore: 80,
      });

    expect(result.status).toBe(200);

    // Verify total score includes all components
    const score = await prismaClient.score.findFirst({
      where: {
        meetingId: module.meetingId,
      },
    });

    expect(score.moduleScore).toBe(80);
    expect(score.totalScore).toBe(255); // 80 + 90 + 85
  });
});
