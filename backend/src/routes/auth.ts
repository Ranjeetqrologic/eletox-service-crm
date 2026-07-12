import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { protect } from "../middleware/auth";

const router = express.Router();

const signToken = (id: string) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "secret",
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
  );
};

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }
    if (!user.isActive) throw new AppError("Account disabled", 401);

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      token: signToken(user._id.toString()),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  })
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, user: req.user });
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
