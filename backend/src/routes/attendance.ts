import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Attendance from "../models/Attendance";
import Staff from "../models/Staff";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const { staff, from, to } = req.query;
    const filter: any = {};
    if (staff) filter.staff = staff;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from as string);
      if (to) filter.date.$lte = new Date(to as string);
    }

    const records = await Attendance.find(filter)
      .populate("staff", "name employeeId")
      .sort({ date: -1 });
    res.json({ success: true, count: records.length, data: records });
  })
);

router.post(
  "/checkin",
  protect,
  restrictTo("technician", "admin", "manager"),
  [body("lat").optional(), body("lng").optional(), body("address").optional()],
  asyncHandler(async (req: Request, res: Response) => {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) throw new AppError("Staff profile not found", 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let record = await Attendance.findOne({ staff: staff._id, date: today });
    if (!record) {
      record = await Attendance.create({
        staff: staff._id,
        date: today,
        checkIn: { ...req.body, time: new Date() },
        status: "present",
      });
    } else {
      record.checkIn = { ...req.body, time: new Date() };
      record.status = "present";
      await record.save();
    }

    res.json({ success: true, data: record });
  })
);

router.post(
  "/checkout",
  protect,
  restrictTo("technician", "admin", "manager"),
  [body("lat").optional(), body("lng").optional(), body("address").optional()],
  asyncHandler(async (req: Request, res: Response) => {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) throw new AppError("Staff profile not found", 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ staff: staff._id, date: today });
    if (!record) throw new AppError("Check in first", 400);

    record.checkOut = { ...req.body, time: new Date() };
    if (record.checkIn && record.checkIn.time) {
      const ms = record.checkOut!.time.getTime() - new Date(record.checkIn.time).getTime();
      record.workingHours = parseFloat((ms / (1000 * 60 * 60)).toFixed(2));
    }
    await record.save();
    res.json({ success: true, data: record });
  })
);

router.post(
  "/leave",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  [body("staff").notEmpty(), body("date").notEmpty(), body("leaveType").isIn(["sick", "casual", "paid", "holiday"])],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const date = new Date(req.body.date);
    date.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { staff: req.body.staff, date },
      { status: "leave", leaveType: req.body.leaveType, notes: req.body.notes },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: record });
  })
);

export default router;
