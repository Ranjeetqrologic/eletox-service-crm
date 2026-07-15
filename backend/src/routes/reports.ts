import express, { Request, Response } from "express";
import Lead from "../models/Lead";
import Job from "../models/Job";
import Payment from "../models/Payment";
import Staff from "../models/Staff";
import Attendance from "../models/Attendance";
import { protect, restrictTo } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

const dateRange = (from?: string, to?: string) => {
  const range: any = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return range;
};

router.get(
  "/dashboard",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const dateFilter = dateRange(from as string | undefined, to as string | undefined);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let leadFilter: any = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
    let staffFilter: any = {};

    if (req.user?.role === "technician") {
      const technicianStaff = await Staff.findOne({ user: req.user._id });
      if (technicianStaff) {
        staffFilter = { assignedStaff: technicianStaff._id };
      }
    }

    const [totalLeads, newLeads, assigned, working, completed, cancelled, pending, halfDone, todayLeads, todayVisits, revenue] = await Promise.all([
      Lead.countDocuments({ ...leadFilter, ...staffFilter }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: "new" }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: "assigned" }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: { $in: ["accepted", "working", "on_the_way", "reached", "half_done"] } }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: "completed" }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: "cancelled" }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: { $in: ["pending", "follow_up", "need_parts", "half_done"] } }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: "half_done" }),
      Lead.countDocuments({ ...staffFilter, createdAt: { $gte: today, $lt: tomorrow } }),
      Lead.countDocuments({ ...staffFilter, assignedAt: { $gte: today, $lt: tomorrow } }),
      Payment.aggregate([{ $match: Object.keys(dateFilter).length ? { createdAt: dateFilter } : {} }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        assigned,
        working,
        completed,
        cancelled,
        pending,
        halfDone,
        todayLeads,
        todayVisits,
        revenue: (revenue as any)?.[0]?.total || 0,
      },
    });
  })
);

router.get(
  "/staff-performance",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const dateFilter = dateRange(from as string | undefined, to as string | undefined);
    const leadFilter = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const staffList = await Staff.find({ role: "technician" }).select("_id name employeeId");
    const performance = await Promise.all(
      staffList.map(async (s) => {
        const assigned = await Lead.countDocuments({ ...leadFilter, assignedStaff: s._id });
        const completed = await Lead.countDocuments({ ...leadFilter, assignedStaff: s._id, status: "completed" });
        const cancelled = await Lead.countDocuments({ ...leadFilter, assignedStaff: s._id, status: "cancelled" });
        const jobs = await Job.find({ staff: s._id, completedAt: { $exists: true } });
        const avgTime = jobs.length
          ? jobs.reduce((sum, j) => sum + (new Date(j.completedAt!).getTime() - new Date(j.startedAt!).getTime()), 0) / jobs.length
          : 0;
        return { staffId: s.employeeId, name: s.name, assigned, completed, cancelled, averageTimeMs: avgTime };
      })
    );

    res.json({ success: true, data: performance });
  })
);

router.get(
  "/lead-source",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const dateFilter = dateRange(from as string | undefined, to as string | undefined);
    const match = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const data = await Lead.aggregate([{ $match: match }, { $group: { _id: "$source", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    res.json({ success: true, data });
  })
);

router.get(
  "/service-report",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const dateFilter = dateRange(from as string | undefined, to as string | undefined);
    const match = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const data = await Lead.aggregate([{ $match: match }, { $group: { _id: "$service", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    res.json({ success: true, data });
  })
);

router.get(
  "/payment-summary",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const dateFilter = dateRange(from as string | undefined, to as string | undefined);
    const match = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const [byMode, byStatus, total] = await Promise.all([
      Payment.aggregate([{ $match: match }, { $group: { _id: "$mode", amount: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { amount: -1 } }]),
      Payment.aggregate([{ $match: match }, { $group: { _id: "$status", amount: { $sum: "$amount" }, count: { $sum: 1 } } }]),
      Payment.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    res.json({ success: true, data: { byMode, byStatus, total: total[0]?.total || 0 } });
  })
);

router.get(
  "/pending-payments",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const jobs = await Job.find({ pendingAmount: { $gt: 0 } })
      .populate("lead", "customerName mobile leadId")
      .populate("staff", "name employeeId")
      .sort({ updatedAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  })
);

router.get(
  "/salary",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { month, year, staff } = req.query;
    const m = parseInt(month as string) || new Date().getMonth() + 1;
    const y = parseInt(year as string) || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);
    const daysInMonth = endDate.getDate();

    let staffFilter: any = { role: "technician" };
    if (staff) staffFilter = { _id: staff };
    if (req.user?.role === "technician") {
      const technicianStaff = await Staff.findOne({ user: req.user._id });
      if (technicianStaff) staffFilter = { _id: technicianStaff._id };
    }

    const staffList = await Staff.find(staffFilter);

    const salaryData = await Promise.all(
      staffList.map(async (s) => {
        const monthlySalary = s.salary || 0;
        const perDaySalary = monthlySalary ? monthlySalary / daysInMonth : 0;

        const records = await Attendance.find({
          staff: s._id,
          date: { $gte: startDate, $lte: endDate },
        });

        let present = 0, absent = 0, halfDay = 0, leave = 0, holiday = 0, workingHours = 0;
        records.forEach((r) => {
          if (r.status === "present") present += 1;
          if (r.status === "absent") absent += 1;
          if (r.status === "half_day") halfDay += 1;
          if (r.status === "leave") leave += 1;
          if (r.status === "holiday") holiday += 1;
          if (r.workingHours) workingHours += r.workingHours;
        });

        const paidDays = present + holiday + (leave * 0); // leave unpaid by default, can be changed
        const unpaidDays = absent + (leave * 1) + (halfDay * 0.5);
        const payableDays = paidDays + halfDay * 0.5;
        const deductionDays = unpaidDays;
        const deductionAmount = deductionDays * perDaySalary;
        const payableSalary = Math.max(0, monthlySalary - deductionAmount);

        return {
          staffId: s._id,
          employeeId: s.employeeId,
          name: s.name,
          monthlySalary,
          daysInMonth,
          present,
          absent,
          halfDay,
          leave,
          holiday,
          workingHours: parseFloat(workingHours.toFixed(2)),
          payableDays: parseFloat(payableDays.toFixed(2)),
          deductionDays: parseFloat(deductionDays.toFixed(2)),
          deductionAmount: parseFloat(deductionAmount.toFixed(2)),
          payableSalary: parseFloat(payableSalary.toFixed(2)),
        };
      })
    );

    res.json({ success: true, data: salaryData });
  })
);

export default router;
