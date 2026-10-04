import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, param, validationResult } from "express-validator";
import crypto from "crypto";
import User, { IUser } from "../models/User";
import { isMailConfigured, sendMail } from "../config/mailer";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { protect, restrictTo } from "../middleware/auth";

const router = express.Router();

const signToken = (id: string) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "secret",
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
  );
};

const ADMIN_ROLES = ["superadmin", "admin", "manager"];
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_TRUSTED_DEVICES = 10;

const hashOtp = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");
const genOtp = () => String(crypto.randomInt(100000, 999999));

const issueOtp = async (user: IUser, purpose: string, deviceId?: string) => {
  const otp = genOtp();
  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpPurpose = purpose;
  user.otpDeviceId = deviceId;
  await user.save();
  const subject = purpose === "reset" ? "Eletox Admin - Password Reset OTP" : "Eletox Admin - New Device Login OTP";
  const intro = purpose === "reset" ? "Use this OTP to reset your admin password." : "A login was attempted from a new device.";
  await sendMail(
    user.email,
    subject,
    `${intro}\n\nYour OTP is: ${otp}\nValid for 10 minutes.\n\nIf this was not you, please change your password immediately.`,
    `<p>${intro}</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p><p>Valid for 10 minutes.</p>`
  );
};

const checkOtp = (user: IUser, otp: string, purpose: string) => {
  if (!user.otpHash || !user.otpExpires || user.otpPurpose !== purpose) throw new AppError("No OTP requested. Please login again.", 400);
  if (user.otpExpires.getTime() < Date.now()) throw new AppError("OTP expired. Please try again.", 400);
  if (hashOtp(String(otp).trim()) !== user.otpHash) throw new AppError("Invalid OTP", 400);
};

const clearOtp = (user: IUser) => {
  user.otpHash = undefined;
  user.otpExpires = undefined;
  user.otpPurpose = undefined;
  user.otpDeviceId = undefined;
};

const trustDevice = (user: IUser, deviceId: string, label?: string) => {
  const list = (user.trustedDevices || []).filter((d) => d.deviceId !== deviceId);
  list.unshift({ deviceId, label, lastUsed: new Date() });
  user.trustedDevices = list.slice(0, MAX_TRUSTED_DEVICES);
};

const loginResponse = (user: IUser) => ({
  success: true,
  token: signToken(user._id.toString()),
  user: { _id: user._id, name: user.name, email: user.email, role: user.role },
});

const findLoginUser = (email: string) =>
  User.findOne({ email: email.toLowerCase() }).select("+password +trustedDevices +otpHash +otpExpires +otpPurpose +otpDeviceId");

const checkPortal = (user: IUser, portal?: string) => {
  const isAdmin = ADMIN_ROLES.includes(user.role);
  if (portal === "admin" && !isAdmin) throw new AppError("This is the admin login. Staff please use the staff login page.", 403);
  if (portal === "staff" && isAdmin) throw new AppError("This is the staff login. Admin please use the admin login page.", 403);
};

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { email, password, deviceId, deviceLabel, portal } = req.body;
    const user = await findLoginUser(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }
    if (!user.isActive && !["superadmin", "admin"].includes(user.role)) {
      throw new AppError("Account disabled", 401);
    }
    checkPortal(user, portal);

    const isAdmin = ADMIN_ROLES.includes(user.role);
    if (isAdmin && deviceId) {
      const trusted = (user.trustedDevices || []).some((d) => d.deviceId === deviceId);
      if (!trusted) {
        if (await isMailConfigured()) {
          await issueOtp(user, "device", deviceId);
          res.json({ success: true, otpRequired: true, message: `New device detected. OTP sent to ${user.email}` });
          return;
        }
      }
      trustDevice(user, deviceId, deviceLabel);
    }

    user.lastLogin = new Date();
    await user.save();
    res.json(loginResponse(user));
  })
);

router.post(
  "/verify-otp",
  [body("email").isEmail().normalizeEmail(), body("otp").notEmpty(), body("deviceId").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { email, otp, deviceId, deviceLabel } = req.body;
    const user = await findLoginUser(email);
    if (!user) throw new AppError("Invalid request", 400);
    checkOtp(user, otp, "device");
    if (user.otpDeviceId !== deviceId) throw new AppError("Device mismatch. Please login again.", 400);

    clearOtp(user);
    trustDevice(user, deviceId, deviceLabel);
    user.lastLogin = new Date();
    await user.save();
    res.json(loginResponse(user));
  })
);

router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const user = await findLoginUser(req.body.email);
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      throw new AppError("Forgot password is only available for admin accounts. Staff please contact admin.", 400);
    }
    if (!(await isMailConfigured())) {
      throw new AppError("Email (SMTP) is not configured. Please set SMTP in Admin Settings.", 400);
    }
    await issueOtp(user, "reset");
    res.json({ success: true, message: `OTP sent to ${user.email}` });
  })
);

router.post(
  "/reset-password",
  [body("email").isEmail().normalizeEmail(), body("otp").notEmpty(), body("password").isLength({ min: 6 })],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const user = await findLoginUser(req.body.email);
    if (!user) throw new AppError("Invalid request", 400);
    checkOtp(user, req.body.otp, "reset");
    clearOtp(user);
    user.password = req.body.password;
    await user.save();
    res.json({ success: true, message: "Password reset successful. Please login." });
  })
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, user: req.user });
  })
);

router.put(
  "/me",
  protect,
  [body("currentPassword").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError("Current password is required", 400);
    const user = await User.findById(req.user?._id).select("+password");
    if (!user || !(await user.comparePassword(req.body.currentPassword))) {
      throw new AppError("Current password is incorrect", 401);
    }
    if (req.body.email) {
      const email = String(req.body.email).toLowerCase().trim();
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) throw new AppError("Email already in use", 400);
      user.email = email;
    }
    if (req.body.name) user.name = req.body.name;
    if (req.body.newPassword) {
      if (String(req.body.newPassword).length < 6) throw new AppError("New password must be at least 6 characters", 400);
      user.password = req.body.newPassword;
    }
    await user.save();
    res.json({ success: true, message: "Account updated", user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  })
);

router.post(
  "/impersonate/:userId",
  protect,
  restrictTo("superadmin", "admin"),
  [param("userId").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) throw new AppError("User not found", 404);
    if (targetUser.role === "superadmin") throw new AppError("Cannot impersonate superadmin", 403);

    targetUser.lastLogin = new Date();
    await targetUser.save();

    res.json({
      success: true,
      token: signToken(targetUser._id.toString()),
      user: { _id: targetUser._id, name: targetUser.name, email: targetUser.email, role: targetUser.role },
    });
  })
);

router.post(
  "/register",
  protect,
  [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 6 }), body("name").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { name, email, password, role, phone } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError("Email already exists", 400);

    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ success: true, user });
  })
);

export default router;
