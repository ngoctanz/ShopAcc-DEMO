import { env } from "./environment.js";

const allowedOrigins = new Set(
  [env.FRONTEND_URL, "http://localhost:3000"]
    .filter(Boolean)
    .map((url) => url.replace(/\/+$/, "")),
);

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 86400, // 24 hours
};
