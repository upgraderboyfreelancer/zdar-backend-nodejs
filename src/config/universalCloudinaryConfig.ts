import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { RequestHandler } from "express";
import createHttpError from "http-errors";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// 📤 Upload file to Cloudinary (for both images and PDFs)
const uploadToCloudinary = (filePath: string, fileType: string): Promise<any> => {
  const resourceType = fileType === 'pdf' ? "raw" : "image";
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { resource_type: resourceType, }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

// 🚀 Multer Middleware for Images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // Save to /uploads for images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Append timestamp to filename
  },
});

// 🚀 Multer Middleware for PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "pdf-uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // Save to /pdf-uploads for PDFs
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Append timestamp to filename
  },
});

// 🚀 Multer Middleware (accepts image files)
const imageUploadMiddleware: RequestHandler = multer({ storage: imageStorage }).single("image");

// 🚀 Multer Middleware (accepts pdf files)
const pdfUploadMiddleware: RequestHandler = multer({ storage: pdfStorage }).single("pdf");

// 🛠️ Express route to handle image upload
const imageUploadHandler: RequestHandler = async (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    if (!req.file) {
      res.status(400).json({ error: "No image file uploaded" });
      return;
    }

    const file = req.file;
    const localPath = path.resolve(__dirname, "../..", file.path);

    // Upload to Cloudinary as an image
    const cloudinaryResult = await uploadToCloudinary(localPath, 'image');

    res.json({
      success: true,
      localPath: `/uploads/${file.filename}`,
      cloudinaryUrl: cloudinaryResult.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🛠️ Express route to handle PDF upload
const pdfUploadHandler: RequestHandler = async (req, res) => {
  const { userId, role, email } = req.user!;

    if (!userId) {
      throw createHttpError(404, { message: 'Profile not found' });
    }
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    if (!req.file) {
      res.status(400).json({ error: "No PDF file uploaded" });
      return;
    }
    

    const file = req.file;
    const localPath = path.resolve(__dirname, "../..", file.path);

    // Upload to Cloudinary as a raw file (for PDFs)
    const cloudinaryResult = await uploadToCloudinary(localPath, 'pdf');

    res.json({
      success: true,
      localPath: `/pdf-uploads/${file.filename}`,
      cloudinaryUrl: cloudinaryResult.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { imageUploadMiddleware, pdfUploadMiddleware, imageUploadHandler, pdfUploadHandler, uploadToCloudinary };
