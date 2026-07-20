import { v4 as uuidv4 } from "uuid";

export const requestId = (req, res, next) => {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${
          Date.now() - start
        }ms`
      );
    }
  });
  next();
};
