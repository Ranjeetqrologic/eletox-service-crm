import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Staff from "../models/Staff";
import User from "../models/User";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadDocs } from "../middleware/upload";

const router = express.Router();

router.get(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const { role, isActive } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const staff = await Staff.find(filter).populate("user", "name email role isActive").sort({ createdAt: -1 });
    res.json({ success: true, count: staff.length, data: staff });
  })
);

router.get(
  "/technicians",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const technicians = await Staff.find({ role: "technician", isActive: true }).select("_id name mobile employeeId");
    res.json({ success: true, data: technicians });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadDocs,
  [
    body("employeeId").notEmpty(),
    body("name").notEmpty(),
    body("mobile").notEmpty(),
    body("address").notEmpty(),
    body("role").isIn(["technician", "manager", "account"]),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const staffData = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    const docMap: Record<string, string> = {
      photo: "photo",
      aadharFront: "aadharFront",
      aadharBack: "aadharBack",
      pan: "pan",
      drivingLicense: "drivingLicense",
    };

    files.forEach((file) => {
      const field = docMap[file.fieldname];
      if (field) staffData[field] = file.path;
    });

    const existing = await Staff.findOne({ employeeId: staffData.employeeId });
    if (existing) throw new AppError("Employee ID already exists", 400);

    const staff = await Staff.create(staffData);
    res.status(201).json({ success: true, data: staff });
  })
);

router.get(
  "/:id",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const staff = await Staff.findById(req.params.id).populate("user", "name email role");
    if (!staff) throw new AppError("Staff not found", 404);
    res.json({ success: true, data: staff });
  })
);

router.put(
  "/:id",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadDocs,
  asyncHandler(async (req: Request, res: Response) => {
    const staff = await Staff.findById(req.params.id);
    if (!staff) throw new AppError("Staff not found", 404);

    const files = (req.files as Express.Multer.File[]) || [];
    const docMap: Record<string, string> = {
      photo: "photo",
      aadharFront: "aadharFront",
      aadharBack: "aadharBack",
      pan: "pan",
      drivingLicense: "drivingLicense",
    };
    files.forEach((file) => {
      const field = docMap[file.fieldname];
      if (field) req.body[field] = file.path;
    });

    Object.assign(staff, req.body);
    await staff.save();
    res.json({ success: true, data: staff });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const staff = await Staff.findById(req.params.id);
    if (!staff) throw new AppError("Staff not found", 404);
    staff.isActive = false;
    await staff.save();
    if (staff.user) await User.findByIdAndUpdate(staff.user, { isActive: false });
    res.json({ success: true, message: "Staff deactivated" });
  })
);

export default router;
