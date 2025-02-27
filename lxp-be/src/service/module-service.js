import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  createModuleValidation,
  getDetailModuleValidation,
  getModulesValidation,
  submitModuleAnswerValidation,
  submitScoreModuleValidation,
} from "../validation/module-validation.js";
import { validate } from "../validation/validation.js";

const createModule = async (user, meetingId, request, file) => {
  const module = validate(createModuleValidation, request);

  // Check if meeting exists and user is the instructor
  const meeting = await prismaClient.meeting.findFirst({
    where: {
      id: meetingId,
      training: {
        instructorId: user.id,
      },
    },
    include: {
      training: true,
    },
  });

  if (!meeting) {
    throw new ResponseError(
      404,
      "Meeting not found or you're not the instructor"
    );
  }

  if (!file) {
    throw new ResponseError(400, "PDF File is required");
  }

  return prismaClient.module.create({
    data: {
      ...module,
      meetingId: meetingId,
      content: file.path.replace(/\\/g, "/").replace("public/", ""), // Simpan path relatif
    },
    select: {
      id: true,
      title: true,
      content: true,
      moduleScore: true,
      meetingId: true,
      moduleAnswer: true,
      createdAt: true,
      updatedAt: true,
      meeting: {
        select: {
          id: true,
          title: true,
          training: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
};

const submitModuleAnswer = async (user, moduleId, request) => {
  // Kita perlu destructure moduleAnswer dari object hasil validasi tersebut
  const { moduleAnswer } = validate(submitModuleAnswerValidation, request);

  // Check if module exists and user is enrolled in the training
  const module = await prismaClient.module.findFirst({
    where: {
      id: moduleId,
      meeting: {
        training: {
          users: {
            some: {
              userId: user.id,
              status: "enrolled",
            },
          },
        },
      },
    },
    include: {
      meeting: {
        include: {
          training: true,
        },
      },
    },
  });

  if (!module) {
    throw new ResponseError(
      404,
      "Module not found or you're not enrolled in this training"
    );
  }

  // Update the module with the answer
  return prismaClient.module.update({
    where: {
      id: moduleId,
    },
    data: {
      moduleAnswer: moduleAnswer,
    },
    select: {
      id: true,
      title: true,
      moduleAnswer: true,
      moduleScore: true,
      meetingId: true,
      createdAt: true,
      updatedAt: true,
      meeting: {
        select: {
          id: true,
          title: true,
          training: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
};

const getModules = async (user, request) => {
  const { meetingId, page, size } = validate(getModulesValidation, request);

  // Check if meeting exists and user is enrolled in the training
  const meeting = await prismaClient.meeting.findFirst({
    where: {
      id: meetingId,
      training: {
        users: {
          some: {
            userId: user.id,
            status: "enrolled",
          },
        },
      },
    },
    include: {
      training: true,
    },
  });

  if (!meeting) {
    throw new ResponseError(
      404,
      "Meeting not found or you're not enrolled in this training"
    );
  }

  // Calculate pagination
  const skip = (page - 1) * size;

  // Get all modules for the meeting with pagination
  const modules = await prismaClient.module.findMany({
    where: {
      meetingId: meetingId,
    },
    skip: skip,
    take: size,
    select: {
      id: true,
      title: true,
      content: true,
      moduleScore: true,
      meetingId: true,
      moduleAnswer: true,
      createdAt: true,
      updatedAt: true,
      meeting: {
        select: {
          id: true,
          title: true,
          training: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  // Get total count of modules for pagination metadata
  const totalItems = await prismaClient.module.count({
    where: {
      meetingId: meetingId,
    },
  });

  return {
    data: modules,
    paging: {
      page: page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / size),
    },
  };
};

const getModuleDetail = async (user, request) => {
  const validationResult = validate(getDetailModuleValidation, request);
  const { meetingId, moduleId } = validationResult;

  // Cek apakah module ada dan user terdaftar di training yang sesuai
  const module = await prismaClient.module.findFirst({
    where: {
      id: moduleId,
      meetingId: meetingId,
      meeting: {
        training: {
          users: {
            some: {
              userId: user.id,
              status: "enrolled",
            },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      content: true,
      moduleScore: true,
      moduleAnswer: true,
      createdAt: true,
      updatedAt: true,
      meeting: {
        select: {
          id: true,
          title: true,
          meetingDate: true,
          training: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!module) {
    throw new ResponseError(
      404,
      "Module not found or you're not enrolled in this training"
    );
  }

  return module;
};

const submitModuleScore = async (user, moduleId, request) => {
  const { moduleScore } = validate(submitScoreModuleValidation, request);

  const module = await prismaClient.module.findFirst({
    where: {
      id: moduleId,
      meeting: {
        training: {
          instructorId: user.id,
        },
      },
    },
    include: {
      meeting: {
        include: {
          training: {
            include: {
              users: {
                where: {
                  status: "enrolled",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!module) {
    throw new ResponseError(
      404,
      "module not found or you're not the instructor"
    );
  }

  // Start a transaction to update both module and score
  return prismaClient.$transaction(async (tx) => {
    // Update module score
    const updatedModule = await tx.module.update({
      where: {
        id: moduleId,
      },
      data: {
        moduleScore: moduleScore,
      },
      select: {
        id: true,
        title: true,
        moduleAnswer: true,
        moduleScore: true,
        meetingId: true,
        createdAt: true,
        updatedAt: true,
        meeting: {
          select: {
            id: true,
            title: true,
            training: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Get enrolled users' training_users records
    const enrolledUsers = module.meeting.training.users;

    // Update scores for all enrolled users
    for (const trainingUser of enrolledUsers) {
      const existingScore = await tx.score.findFirst({
        where: {
          trainingUserId: trainingUser.id,
          meetingId: module.meetingId,
        },
      });

      if (existingScore) {
        await tx.score.update({
          where: {
            id: existingScore.id,
          },
          data: {
            moduleScore: moduleScore,
            totalScore:
              (moduleScore +
                existingScore.quizScore +
                existingScore.taskScore) /
              3,
          },
        });
      }
    }

    return updatedModule;
  });
};

export default {
  createModule,
  submitModuleAnswer,
  getModules,
  submitModuleScore,
  getModuleDetail,
};
