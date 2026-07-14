import multer from "multer";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const PHOTO_DIR = path.join(UPLOAD_DIR, "photos");
const DOC_DIR = path.join(UPLOAD_DIR, "documents");

[UPLOAD_DIR, PHOTO_DIR, DOC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const createStorage = (dest: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, unique);
    },
  });

export const uploadPhotos = multer({
  storage: createStorage(PHOTO_DIR),
  limits: { fileSize: 20 * 1024 * 1024 },
}).array("photos", 20);

export const uploadDocs = multer({
  storage: createStorage(DOC_DIR),
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "drivingLicense", maxCount: 1 },
]);

export const uploadSingle = multer({
  storage: createStorage(PHOTO_DIR),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("image");

export const getFileUrl = (file: Express.Multer.File) => {
  const folder = file.destination.includes("documents") ? "documents" : "photos";
  return `/uploads/${folder}/${file.filename}`;
};
