import { responseUtils } from "../utils/response.util.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return responseUtils.validationError(res, errors);
    }

    req.body = value;
    next();
  };
};
