import supertest from "supertest";
import { prismaClient } from "../application/database.js";
import { web } from "../application/web.js";
import path from "path";
import fs from "fs";
import {
  createInitScore,
  createMeeting,
  createModule,
  createTestInstructor,
  createTestUser,
  createTraining,
  createTrainingUser,
  getTestInstructor,
  removeAll,
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

    const instructor = await createTestInstructor();

    const training = await createTraining(instructor.id);

    await createMeeting(training.id);
  });

  afterEach(async () => {
    const moduleDir = path.join(process.cwd(), "public", "modules");

    if (fs.existsSync(moduleDir)) {
      const files = fs.readdirSync(moduleDir);
      files.forEach((file) => {
        fs.unlinkSync(path.join(moduleDir, file));
      });
    }

    await removeAll();
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
      .attach("content", testPdfPath);

    console.log(result.body);

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
    const user = await createTestUser();
    const instructor = await createTestInstructor();
    const training = await createTraining(instructor.id);
    await createTrainingUser(training.id, user.id);
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
        answer: "This is my answer to the module",
      });

    console.log(result.body);

    expect(result.status).toBe(200);
    expect(result.body.data.answer).toBe("This is my answer to the module");

    // Verify that a submission was created in the database
    const submission = await prismaClient.moduleSubmission.findFirst({
      where: {
        moduleId: module.id,
      },
    });

    expect(submission).not.toBeNull();
    expect(submission.answer).toBe("This is my answer to the module");
  });

  it("Should update existing submission when submitting again", async () => {
    const module = await prismaClient.module.findFirst({
      where: { title: "Test Module" },
    });

    // First submission
    await supertest(web)
      .post(`/api/modules/${module.id}/answer`)
      .set("Authorization", "Bearer test")
      .send({
        answer: "First answer",
      });

    // Second submission
    const result = await supertest(web)
      .post(`/api/modules/${module.id}/answer`)
      .set("Authorization", "Bearer test")
      .send({
        answer: "Updated answer",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.answer).toBe("Updated answer");

    // Verify we only have one submission in the database
    const submissions = await prismaClient.moduleSubmission.findMany({
      where: {
        moduleId: module.id,
      },
    });

    expect(submissions.length).toBe(1);
    expect(submissions[0].answer).toBe("Updated answer");
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
        answer: "This is my answer to the module",
      });

    expect(result.status).toBe(404);
  });

  it("Should reject invalid module ID", async () => {
    const result = await supertest(web)
      .post(`/api/modules/999999/answer`)
      .set("Authorization", "Bearer test")
      .send({
        answer: "This is my answer to the module",
      });

    expect(result.status).toBe(404);
  });
});

describe("GET /api/meetings/:meetingId/modules/:moduleId", () => {
  beforeEach(async () => {
    const user = await createTestUser();
    const instructor = await createTestInstructor();
    const training = await createTraining(instructor.id);
    const trainingUser = await createTrainingUser(training.id, user.id);
    const meeting = await createMeeting(training.id);
    const module = await createModule(meeting.id);

    // Optionally create a module submission for testing
    await prismaClient.moduleSubmission.create({
      data: {
        moduleId: module.id,
        trainingUserId: trainingUser.id,
        answer: "Test answer",
        score: 80,
      },
    });
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
    expect(result.body.data.submission).toBeDefined();
    expect(result.body.data.submission.score).toBeDefined();
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
    const user = await createTestUser();
    const instructor = await createTestInstructor();
    const training = await createTraining(instructor.id);
    const trainingUser = await createTrainingUser(training.id, user.id);
    const meeting = await createMeeting(training.id);
    await createModule(meeting.id);

    // Initialize score for the user
    await createInitScore(trainingUser.id, meeting.id);
  });

  afterEach(async () => {
    await removeAll();
  });

  it("Should submit module score and update score table successfully", async () => {
    const module = await prismaClient.module.findFirst({
      where: { title: "Test Module" },
    });

    const instructor = await getTestInstructor();

    const result = await supertest(web)
      .post(`/api/modules/${module.id}/score`)
      .set("Authorization", "Bearer test-instructor")
      .send({
        moduleScore: 90,
      });

    expect(result.status).toBe(200);
    expect(result.body.data.updatedSubmissions).toBeDefined();
    expect(result.body.data.updatedSubmissions[0].score).toBe(90);

    // Verify module submission was created
    const moduleSubmission = await prismaClient.moduleSubmission.findFirst({
      where: {
        moduleId: module.id,
      },
    });

    expect(moduleSubmission).toBeDefined();
    expect(moduleSubmission.score).toBe(90);

    // Verify score table was updated
    const score = await prismaClient.score.findFirst({
      where: {
        meetingId: module.meetingId,
      },
    });

    expect(score.moduleScore).toBe(90);
    expect(score.totalScore).toBe(30); // Since quiz and task scores are 0
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
        taskScore: 90,
        totalScore: 60,
      },
    });

    const result = await supertest(web)
      .post(`/api/modules/${module.id}/score`)
      .set("Authorization", "Bearer test-instructor")
      .send({
        moduleScore: 90,
      });

    expect(result.status).toBe(200);

    // Verify total score includes all components
    const score = await prismaClient.score.findFirst({
      where: {
        meetingId: module.meetingId,
      },
    });

    expect(score.moduleScore).toBe(90);
    expect(score.totalScore).toBe(90); // (90 + 90 + 90) / 3
  });

  it("Should create new module submission if one doesn't exist", async () => {
    // Create a new user and add them to the training
    const newUser = await createTestUser("new@test.com");
    const training = await prismaClient.training.findFirst();
    const trainingUser = await createTrainingUser(training.id, newUser.id);
    const module = await prismaClient.module.findFirst();

    // Initialize score for the new user
    await createInitScore(trainingUser.id, module.meetingId);

    const result = await supertest(web)
      .post(`/api/modules/${module.id}/score`)
      .set("Authorization", "Bearer test-instructor")
      .send({
        moduleScore: 95,
      });

    expect(result.status).toBe(200);

    // Check both users have module submissions
    const moduleSubmissions = await prismaClient.moduleSubmission.findMany({
      where: {
        moduleId: module.id,
      },
    });

    expect(moduleSubmissions.length).toBe(2);

    // Check both users' scores were updated
    const scores = await prismaClient.score.findMany({
      where: {
        meetingId: module.meetingId,
      },
    });

    expect(scores.length).toBe(2);
    scores.forEach((score) => {
      expect(score.moduleScore).toBe(95);
    });
  });
});
