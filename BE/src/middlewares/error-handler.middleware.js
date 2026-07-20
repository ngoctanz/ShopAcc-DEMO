import { responseUtils } from "../utils/response.util.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return responseUtils.validationError(res, errors);
  }

  if (err.name === "CastError") {
    return responseUtils.badRequest(res, "Invalid ID format");
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return responseUtils.badRequest(res, `${field} already exists`);
  }

  if (err.name === "JsonWebTokenError") {
    return responseUtils.unauthorized(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return responseUtils.unauthorized(res, "Token expired");
  }

  return responseUtils.error(
    res,
    err.message || "Internal server error",
    err.statusCode || 500
  );
};
