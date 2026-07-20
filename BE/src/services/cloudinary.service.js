import cloudinary from "../config/cloudinary.js";
import { env } from "../config/environment.js";

/**
 * Cloudinary Service - Upload, Update, Delete images/videos
 */

const DEFAULT_FOLDER = env.CLOUDINARY_FOLDER || "shop-game";

export const uploadFile = async (filePath, options = {}) => {
  const {
    folder = DEFAULT_FOLDER,
    publicId,
    resourceType = "auto",
  } = options;

  const uploadOptions = {
    folder,
    resource_type: resourceType,
    overwrite: true,
  };

  if (publicId) {
    uploadOptions.public_id = publicId;
  }

  const result = await cloudinary.uploader.upload(filePath, uploadOptions);

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    resourceType: result.resource_type,
    bytes: result.bytes,
  };
};


export const uploadBuffer = async (buffer, options = {}) => {
  const {
    folder = DEFAULT_FOLDER,
    publicId,
    resourceType = "auto",
  } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      overwrite: true,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};


export const updateFile = async (publicId, filePath, options = {}) => {
  const { resourceType = "auto" } = options;

  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: resourceType,
    overwrite: true,
    invalidate: true, // Invalidate CDN cache
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    resourceType: result.resource_type,
    bytes: result.bytes,
  };
};


export const updateBuffer = async (publicId, buffer, options = {}) => {
  const { resourceType = "auto" } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};


export const deleteFile = async (publicId, resourceType = "image") => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });

  return {
    publicId,
    result: result.result, // 'ok' | 'not found'
  };
};


export const deleteFiles = async (publicIds, resourceType = "image") => {
  const result = await cloudinary.api.delete_resources(publicIds, {
    resource_type: resourceType,
    invalidate: true,
  });

  return {
    deleted: result.deleted,
    partial: result.partial,
  };
};


export const extractPublicId = (url) => {
  if (!url || !url.includes("cloudinary.com")) {
    return null;
  }

  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};


export const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  const transformations = {
    quality,
    fetch_format: format,
  };

  if (width) transformations.width = width;
  if (height) transformations.height = height;
  if (width || height) transformations.crop = crop;

  return cloudinary.url(publicId, transformations);
};

export default {
  uploadFile,
  uploadBuffer,
  updateFile,
  updateBuffer,
  deleteFile,
  deleteFiles,
  extractPublicId,
  getOptimizedUrl,
};
