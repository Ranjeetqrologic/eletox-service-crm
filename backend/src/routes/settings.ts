import express, { Request, Response } from "express";
import Company from "../models/Company";
import User from "../models/User";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadSingle, getFileUrl } from "../middleware/upload";

const router = express.Router();

router.get(
  "/company",
  asyncHandler(async (_req: Request, res: Response) => {
    const company = await Company.findOne();
    res.json({ success: true, data: company || {} });
  })
);

router.put(
  "/company",
  protect,
  restrictTo("superadmin", "admin"),
  uploadSingle,
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const update = { ...req.body };
    if (file) update.logo = getFileUrl(file);

    const company = await Company.findOneAndUpdate({}, update, { upsert: true, new: true });
    res.json({ success: true, data: company });
  })
);

router.get(
  "/users",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find(req.query.role ? { role: req.query.role } : {}).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  })
);

router.put(
  "/users/:id/role",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("-password");
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: user });
  })
);

router.put(
  "/users/:id/status",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select("-password");
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: user });
  })
);

export default router;
