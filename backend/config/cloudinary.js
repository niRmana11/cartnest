import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary Configuration
 *
 * Handles image uploads to Cloudinary CDN
 * Returns: { url, publicId } for storage in MongoDB
 *
 */

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param fileBuffer
 * @param fileName
 * @returns { url, publicId }
 */
export const uploadImageToCloudinary = async (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "cartnest/products",
        resource_type: "auto",
        public_id: `${Date.now()}-${fileName.replace(/\s+/g, "-")}`,
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      },
    );

    // Write buffer to upload stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param publicId
 * @returns
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Image deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error(`Failed to delete image: ${error.message}`);
    throw error;
  }
};

/**
 * Upload image from URL
 * Useful for seeding with placeholder images
 * @param imageUrl
 * @param fileName
 * @returns { url, publicId }
 */
export const uploadImageFromUrl = async (imageUrl, fileName) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "cartnest/products",
      public_id: `${Date.now()}-${fileName.replace(/\s+/g, "-")}`,
      quality: "auto",
      fetch_format: "auto",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error(`Failed to upload from URL: ${error.message}`);
    throw error;
  }
};

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  uploadImageFromUrl,
};
