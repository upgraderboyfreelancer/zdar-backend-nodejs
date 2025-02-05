import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { RequestHandler } from "express";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// 📌 Set up local storage with Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 🚀 Multer Middleware (accepts files from any field)
const multerMiddleware: RequestHandler = multer({ storage }).any();

// 📤 Upload file to Cloudinary
const uploadToCloudinary = (filePath: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { resource_type: "image" }, (error, result) => {
      if (error) return reject(error);
      resolve(result as UploadApiResponse);
    });
  });
};

// 🛠️ Express route to handle file uploads
const uploadHandler: RequestHandler = async (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    console.log(req.file, req.files)
    if (!req.files) {
      res.status(400).json({ error: "No files uploaded" });
      return
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const localPath = path.resolve(__dirname, "../..", file.path);
        try {
          // Upload to Cloudinary
          const cloudinaryResult = await uploadToCloudinary(localPath);
          return {
            fieldname: file.fieldname,
            localPath: `/uploads/${file.filename}`,
            cloudinaryUrl: cloudinaryResult.secure_url,
          };
        } catch (error) {
          console.error("Cloudinary upload failed:", error);
          return {
            fieldname: file.fieldname,
            localPath: `/uploads/${file.filename}`,
            cloudinaryUrl: null, // Cloudinary failed, fallback to local
          };
        }
      })
    );

    res.json({ success: true, files: uploadResults });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Function to handle file uploads and return the results
const uploadFiles = async (files: Express.Multer.File[]): Promise<{ fieldname: string, localUrl: string, cloudinaryUrl: string | null }[]> => {
  console.log(process.env.CLOUDINARY_CLOUD_NAME)
  // Get the current directory path using ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const uploadResults = await Promise.all(
    files.map(async (file) => {
      console.log(file)
      const localPath = path.join(__dirname, "../..", file.path);
      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(localPath);
        return {
          fieldname: file.fieldname,
          localUrl: `/uploads/${file.filename}`,
          cloudinaryUrl: cloudinaryResult.secure_url,
        };
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return {
          fieldname: file.fieldname,
          localUrl: `/uploads/${file.filename}`,
          cloudinaryUrl: null, // Cloudinary failed, fallback to local
        };
      }
    })
);

  return uploadResults;
};



export { multerMiddleware, uploadHandler, uploadFiles, uploadToCloudinary };