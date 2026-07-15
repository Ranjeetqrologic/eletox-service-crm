import express, { Request, Response } from "express";
import Banner from "../models/Banner";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadSingle, getFileUrl } from "../middleware/upload";

const router = express.Router();

router.get(
  "/public",
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: data.length, data });
  })
);

router.get(
  "/",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await Banner.find().sort({ order: 1, createdAt: -1 });
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
    if (!file) throw new AppError("Banner image is required", 400);
    const banner = await Banner.create({
      ...req.body,
      image: getFileUrl(file),
    });
    res.status(201).json({ success: true, data: banner });
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
    const banner = await Banner.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!banner) throw new AppError("Banner not found", 404);
    res.json({ success: true, data: banner });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) throw new AppError("Banner not found", 404);
    res.json({ success: true, message: "Banner deleted" });
  })
);

export default router;
