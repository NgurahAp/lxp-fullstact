import Joi from "joi";

const createModuleValidation = Joi.object({
  title: Joi.string().max(255).required(),
  moduleScore: Joi.number().min(0).default(0),
});

const submitModuleAnswerValidation = Joi.object({
  moduleAnswer: Joi.string().required(),
});

export { createModuleValidation, submitModuleAnswerValidation };
