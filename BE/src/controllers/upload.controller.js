import cloudinaryService from "../services/cloudinary.service.js";

/**
 * Upload single file
 * POST /api/upload
 */
export const uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { folder, publicId, resourceType } = req.body;

    const result = await cloudinaryService.uploadBuffer(req.file.buffer, {
      folder,
      publicId,
      resourceType: resourceType || "auto",
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple files
 * POST /api/upload/multiple
 */
export const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const { folder, resourceType } = req.body;

    const uploadPromises = req.files.map((file) =>
      cloudinaryService.uploadBuffer(file.buffer, {
        folder,
        resourceType: resourceType || "auto",
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload from URL
 * POST /api/upload/url
 */
export const uploadFromUrl = async (req, res, next) => {
  try {
    const { url, folder, publicId, resourceType } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const result = await cloudinaryService.uploadFile(url, {
      folder,
      publicId,
      resourceType: resourceType || "auto",
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete file
 * DELETE /api/upload/:publicId
 */
export const deleteFile = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    const result = await cloudinaryService.deleteFile(
      decodeURIComponent(publicId),
      resourceType || "image"
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete multiple files
 * POST /api/upload/delete-multiple
 */
export const deleteMultiple = async (req, res, next) => {
  try {
    const { publicIds, resourceType } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Public IDs array is required",
      });
    }

    const result = await cloudinaryService.deleteFiles(
      publicIds,
      resourceType || "image"
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
