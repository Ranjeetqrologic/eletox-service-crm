import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Role from "../models/Role";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get(
  "/",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const roles = await Role.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: roles });
  })
);

router.get(
  "/all",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const roles = await Role.find().sort({ name: 1 });
    res.json({ success: true, data: roles });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { name, permissions, isDefault } = req.body;
    const existing = await Role.findOne({ name: name.toLowerCase() });
    if (existing) throw new AppError("Role already exists", 400);

    const role = await Role.create({
      name: name.toLowerCase(),
      permissions: permissions || [],
      isDefault: isDefault || false,
    });

    res.status(201).json({ success: true, data: role });
  })
);

router.put(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const role = await Role.findById(req.params.id);
    if (!role) throw new AppError("Role not found", 404);

    const updates = ["name", "permissions", "isDefault", "isActive"];
    updates.forEach((field) => {
      if (req.body[field] !== undefined) (role as any)[field] = req.body[field];
    });

    await role.save();
    res.json({ success: true, data: role });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const role = await Role.findById(req.params.id);
    if (!role) throw new AppError("Role not found", 404);
    await role.deleteOne();
    res.json({ success: true, message: "Role deleted" });
  })
);

export default router;
