import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import LeadStatus from "../models/LeadStatus";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get(
  "/",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const statuses = await LeadStatus.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: statuses });
  })
);

router.get(
  "/all",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const statuses = await LeadStatus.find().sort({ order: 1 });
    res.json({ success: true, data: statuses });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("label").notEmpty().withMessage("Label is required"),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { name, label, color, order, isDefault } = req.body;
    const existing = await LeadStatus.findOne({ name: name.toLowerCase() });
    if (existing) throw new AppError("Status already exists", 400);

    const status = await LeadStatus.create({
      name: name.toLowerCase(),
      label,
      color: color || "#6B7280",
      order: order ?? 0,
      isDefault: isDefault || false,
    });

    res.status(201).json({ success: true, data: status });
  })
);

router.put(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const status = await LeadStatus.findById(req.params.id);
    if (!status) throw new AppError("Status not found", 404);

    const updates = ["label", "color", "order", "isDefault", "isActive"];
    updates.forEach((field) => {
      if (req.body[field] !== undefined) (status as any)[field] = req.body[field];
    });

    await status.save();
    res.json({ success: true, data: status });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const status = await LeadStatus.findById(req.params.id);
    if (!status) throw new AppError("Status not found", 404);
    await status.deleteOne();
    res.json({ success: true, message: "Status deleted" });
  })
);

export default router;
