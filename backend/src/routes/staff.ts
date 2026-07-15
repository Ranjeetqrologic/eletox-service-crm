import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Staff from "../models/Staff";
import User from "../models/User";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadDocs, getFileUrl } from "../middleware/upload";

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
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("mobile").notEmpty(),
    body("address").notEmpty(),
    body("role").isIn(["superadmin", "admin", "manager", "account", "technician"]),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const staffData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const docFields = ["photo", "aadharFront", "aadharBack", "pan", "drivingLicense"];
    docFields.forEach((field) => {
      if (files?.[field]?.[0]) staffData[field] = getFileUrl(files[field][0]);
    });

    const existing = await Staff.findOne({ employeeId: staffData.employeeId });
    if (existing) throw new AppError("Employee ID already exists", 400);

    const existingUser = await User.findOne({ email: staffData.email });
    if (existingUser) throw new AppError("Email already registered", 400);

    const user = await User.create({
      name: staffData.name,
      email: staffData.email,
      password: staffData.password,
      role: staffData.role,
      phone: staffData.mobile,
    });

    const staff = await Staff.create({
      ...staffData,
      user: user._id,
    });

    await staff.populate("user", "name email role isActive");
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

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const docFields = ["photo", "aadharFront", "aadharBack", "pan", "drivingLicense"];
    docFields.forEach((field) => {
      if (files?.[field]?.[0]) req.body[field] = getFileUrl(files[field][0]);
    });

    Object.assign(staff, req.body);
    await staff.save();

    if (staff.user && req.body.password) {
      const user = await User.findById(staff.user);
      if (user) {
        user.password = req.body.password;
        await user.save();
      }
    }

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
