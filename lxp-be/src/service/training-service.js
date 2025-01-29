import { prismaClient } from "../application/database.js";
import {
  createTrainingUserValidation,
  createTrainingValidation,
} from "../validation/training-validation.js";
import { validate } from "../validation/validation.js";
import { ResponseError } from "../error/response-error.js";

const createTraining = async (user, request) => {
  const training = validate(createTrainingValidation, request);

  // Ensure the instructorId matches the logged-in user's ID
  if (training.instructorId !== user.id) {
    throw new ResponseError(
      403,
      "You can only create training with your own instructor ID"
    );
  }

  return prismaClient.training.create({
    data: training,
    select: {
      id: true,
      title: true,
      description: true,
      instructorId: true,
      createdAt: true,
      updatedAt: true,
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const createTrainingUser = async (request) => {
  const trainingUser = validate(createTrainingUserValidation, request);

  // Verify if training and user exist
  const training = await prismaClient.training.findUnique({
    where: { id: trainingUser.trainingId },
  });
  if (!training) {
    throw new ResponseError(404, "Training not Found");
  }

  const user = await prismaClient.user.findUnique({
    where: { id: trainingUser.userId },
  });

  if (!user) {
    throw new ResponseError(404, "User not Found");
  }

  const existingEnrollment = await prismaClient.training_Users.findFirst({
    where: {
      trainingId: trainingUser.trainingId,
      userId: trainingUser.userId,
    },
  });

  if (existingEnrollment) {
    throw new ResponseError(400, "User already enrolled in this training");
  }

  return prismaClient.training_Users.create({
    data: trainingUser,
    select: {
      id: true,
      trainingId: true,
      userId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      training: {
        select: {
          title: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

export default { createTraining, createTrainingUser };
