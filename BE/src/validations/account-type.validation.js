import Joi from "joi";

export const accountTypeValidation = {
  create: Joi.object({
    code: Joi.string().min(2).max(20).uppercase().required().messages({
      "any.required": "Code is required",
    }),
    name: Joi.string().min(2).max(100).required().messages({
      "any.required": "Name is required",
    }),
    description: Joi.string().allow("").optional(),
    isActive: Joi.boolean().optional(),
  }),

  update: Joi.object({
    code: Joi.string().min(2).max(20).uppercase().optional(),
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().allow("").optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};
