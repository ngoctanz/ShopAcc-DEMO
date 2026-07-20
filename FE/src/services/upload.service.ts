import { API_ROUTES } from '@/constants/routes';
import { api } from '@/lib/fetch';

export interface UploadResult {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
  bytes?: number;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'auto';
}

/**
 * Upload Service - Upload files to Cloudinary via BE
 */
class UploadService {
  /**
   * Upload single file
   */
  async uploadFile(file: File, _options?: UploadOptions): Promise<UploadResult> {
    // Use api.upload which handles FormData properly
    return api.upload<UploadResult>(API_ROUTES.UPLOAD.SINGLE, file, 'file');
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], _options?: UploadOptions): Promise<UploadResult[]> {
    // Use api.uploadMultiple which handles FormData properly
    return api.uploadMultiple<UploadResult[]>(API_ROUTES.UPLOAD.MULTIPLE, files, 'files');
  }

  /**
   * Update/Replace existing file (same publicId)
   */
  async updateFile(_publicId: string, file: File): Promise<UploadResult> {
    return api.upload<UploadResult>(API_ROUTES.UPLOAD.SINGLE, file, 'file');
  }

  /**
   * Delete file by publicId
   */
  async deleteFile(publicId: string): Promise<{ result: string }> {
    const res = await api.delete<{ success: boolean; data: { result: string } }>(
      API_ROUTES.UPLOAD.DELETE(publicId)
    );
    return res.data;
  }

  /**
   * Upload from base64 string
   */
  async uploadBase64(
    base64: string,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    // Convert base64 to File
    const res = await fetch(base64);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: blob.type });

    return this.uploadFile(file, options);
  }

  /**
   * Upload from URL (download and re-upload)
   */
  async uploadFromUrl(url: string, options?: UploadOptions): Promise<UploadResult> {
    const res = await api.post<{ success: boolean; data: UploadResult }>(
      `${API_ROUTES.UPLOAD.SINGLE}/url`,
      { url, ...options }
    );
    return res.data;
  }
}

export const uploadService = new UploadService();
