import express, { Request, Response } from "express";
import Gallery from "../models/Gallery";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadSingle, getFileUrl } from "../middleware/upload";

const router = express.Router();

router.get(
  "/public",
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await Gallery.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: data.length, data });
  })
);

router.get(
  "/",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: data.length, data });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin"),
  uploadSingle,
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    if (!file) throw new AppError("Gallery image is required", 400);
    const item = await Gallery.create({
      ...req.body,
      image: getFileUrl(file),
    });
    res.status(201).json({ success: true, data: item });
  })
);

router.put(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  uploadSingle,
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const update = { ...req.body };
    if (file) update.image = getFileUrl(file);
    const item = await Gallery.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) throw new AppError("Gallery item not found", 404);
    res.json({ success: true, data: item });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) throw new AppError("Gallery item not found", 404);
    res.json({ success: true, message: "Gallery item deleted" });
  })
);

export default router;
