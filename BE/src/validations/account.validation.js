import Joi from "joi";

export const accountValidation = {
  create: Joi.object({
    packageId: Joi.string().optional(),
    typeId: Joi.string().optional(), // For backward compatibility
    accountInfo: Joi.string().max(500).optional(),
    price: Joi.number().min(0).optional(),
    originalPrice: Joi.number().min(0).allow(null).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    coverImage: Joi.string().allow(null, "").optional(),
    featuredSkins: Joi.array().items(Joi.string()).optional(),
    credentials: Joi.object({
      username: Joi.string().required().messages({
        "any.required": "Username is required",
      }),
      password: Joi.string().required().messages({
        "any.required": "Password is required",
      }),
      additionalInfo: Joi.string().allow(null, "").optional(),
    })
      .required()
      .messages({
        "any.required": "Credentials are required",
      }),
  })
    .or("packageId", "typeId")
    .messages({
      "object.missing": "Either packageId or typeId is required",
    }),

  update: Joi.object({
    packageId: Joi.string().optional(),
    typeId: Joi.string().optional(), // For backward compatibility
    accountInfo: Joi.string().max(500).optional(),
    price: Joi.number().min(0).optional(),
    originalPrice: Joi.number().min(0).allow(null).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    coverImage: Joi.string().allow(null, "").optional(),
    featuredSkins: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid("AVAILABLE", "SOLD", "LOCKED").optional(),
    credentials: Joi.object({
      username: Joi.string().optional(),
      password: Joi.string().optional(),
      additionalInfo: Joi.string().allow(null, "").optional(),
    }).optional(),
  }).min(1),
};
