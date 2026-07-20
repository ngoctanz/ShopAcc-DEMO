import { v2 as cloudinary } from "cloudinary";
import { env } from "./environment.js";

// Configure Cloudinary with separate credentials
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Debug: Check if credentials are loaded
if (
  !env.CLOUDINARY_CLOUD_NAME ||
  !env.CLOUDINARY_API_KEY ||
  !env.CLOUDINARY_API_SECRET
) {
  console.warn("⚠️  Cloudinary credentials not found in environment variables");
} else {
  console.log(`✅ Cloudinary configured: ${env.CLOUDINARY_CLOUD_NAME}`);
}

export default cloudinary;
