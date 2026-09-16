import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Staff from "../models/Staff";
import User from "../models/User";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadDocs, getFileUrl } from "../middleware/upload";

const router = express.Router();

const BANK_FIELDS = ["bankName", "accountNumber", "ifsc", "upi"] as const;

// Multipart forms send bank fields flat; nest them under bankDetails.
const pickBankDetails = (data: any) => {
  const bank: Record<string, string> = { ...(data.bankDetails || {}) };
  BANK_FIELDS.forEach((f) => {
    if (data[f] !== undefined && data[f] !== "") bank[f] = data[f];
    delete data[f];
  });
  return Object.keys(bank).length ? bank : undefined;
};

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

const nextEmployeeId = async () => {
  const last = await Staff.findOne({ employeeId: /^EMP\d+$/ }).sort({ employeeId: -1 }).select("employeeId");
  const n = last ? parseInt(last.employeeId.replace("EMP", ""), 10) + 1 : 1;
  return `EMP${String(n).padStart(3, "0")}`;
};

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadDocs,
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("mobile").notEmpty(),
    body("address").notEmpty(),
    body("role").notEmpty(),
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

    if (staffData.employeeId) {
      const existing = await Staff.findOne({ employeeId: staffData.employeeId });
      if (existing) throw new AppError("Employee ID already exists", 400);
    } else {
      staffData.employeeId = await nextEmployeeId();
    }

    const existingUser = await User.findOne({ email: staffData.email });
    if (existingUser) throw new AppError("Email already registered", 400);

    const user = await User.create({
      name: staffData.name,
      email: staffData.email,
      password: staffData.password,
      role: staffData.role,
      phone: staffData.mobile,
    });

    const bankDetails = pickBankDetails(staffData);
    const staff = await Staff.create({
      ...staffData,
      ...(bankDetails ? { bankDetails } : {}),
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

    const bankDetails = pickBankDetails(req.body);
    if (req.body.password === "") delete req.body.password;
    if (req.body.employeeId && req.body.employeeId !== staff.employeeId) {
      const dup = await Staff.findOne({ employeeId: req.body.employeeId, _id: { $ne: staff._id } });
      if (dup) throw new AppError("Employee ID already exists", 400);
    }
    if (req.body.email) {
      const dupUser = await User.findOne({ email: req.body.email, _id: { $ne: staff.user } });
      if (dupUser) throw new AppError("Email already registered", 400);
    }
    Object.assign(staff, req.body);
    if (bankDetails) staff.bankDetails = { ...(staff.bankDetails || {}), ...bankDetails };
    await staff.save();

    if (staff.user) {
      const user = await User.findById(staff.user);
      if (user) {
        if (req.body.password) user.password = req.body.password;
        if (req.body.role) user.role = req.body.role;
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.mobile) user.phone = req.body.mobile;
        await user.save();
      }
    }

    await staff.populate("user", "name email role isActive");

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
