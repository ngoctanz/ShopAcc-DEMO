import Joi from "joi";

export const discountValidation = {
  create: Joi.object({
    title: Joi.string().min(2).max(100).required().messages({
      "any.required": "Title is required",
      "string.min": "Title must be at least 2 characters",
      "string.max": "Title cannot exceed 100 characters",
    }),
    description: Joi.string().allow("").max(500).optional().messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    discountPercent: Joi.number().min(0).max(100).required().messages({
      "any.required": "Discount percent is required",
      "number.min": "Discount percent cannot be negative",
      "number.max": "Discount percent cannot exceed 100",
    }),
    applicablePackages: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .required()
      .messages({
        "any.required": "Applicable packages are required",
        "array.min": "At least one package must be selected",
        "string.pattern.base": "Invalid package ID format",
      }),
    endDate: Joi.date()
      .min("now")
      .optional()
      .messages({
        "date.base": "End date must be a valid date",
        "date.min": "End date must be today or later",
      }),
    isActive: Joi.boolean().optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Title must be at least 2 characters",
      "string.max": "Title cannot exceed 100 characters",
    }),
    description: Joi.string().allow("").max(500).optional().messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    discountPercent: Joi.number().min(0).max(100).optional().messages({
      "number.min": "Discount percent cannot be negative",
      "number.max": "Discount percent cannot exceed 100",
    }),
    applicablePackages: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .optional()
      .messages({
        "string.pattern.base": "Invalid package ID format",
      }),
    endDate: Joi.date()
      .min("now")
      .optional()
      .messages({
        "date.base": "End date must be a valid date",
        "date.min": "End date must be today or later",
      }),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

