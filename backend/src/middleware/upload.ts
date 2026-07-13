import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "escm/photos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, height: 1600, crop: "limit" }],
  } as any,
});

const docStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "escm/documents",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  } as any,
});

export const uploadPhotos = multer({
  storage: photoStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
}).array("photos", 20);

export const uploadDocs = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "drivingLicense", maxCount: 1 },
]);

export const uploadSingle = multer({
  storage: photoStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("image");
