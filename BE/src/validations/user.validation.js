import Joi from "joi";

export const userValidation = {
  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().allow(null, "").optional(),
    avatar: Joi.string().allow(null).optional(),
    status: Joi.string().valid("active", "banned").optional(),
  }).min(1),

  updateBalance: Joi.object({
    amount: Joi.number().required().messages({
      "any.required": "Amount is required",
    }),
    action: Joi.string().valid("add", "subtract").required().messages({
      "any.required": "Action is required",
      "any.only": "Action must be add or subtract",
    }),
    reason: Joi.string().required().messages({
      "any.required": "Reason is required",
    }),
  }),
};
