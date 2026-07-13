import express, { Request, Response } from "express";
import Lead from "../models/Lead";
import Job from "../models/Job";
import Payment from "../models/Payment";
import Staff from "../models/Staff";
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

    const leadFilter = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const [totalLeads, newLeads, assigned, working, completed, cancelled, todayLeads, todayVisits, revenue] = await Promise.all([
      Lead.countDocuments(leadFilter),
      Lead.countDocuments({ ...leadFilter, status: "new" }),
      Lead.countDocuments({ ...leadFilter, status: "assigned" }),
      Lead.countDocuments({ ...leadFilter, status: { $in: ["working", "on_the_way", "reached"] } }),
      Lead.countDocuments({ ...leadFilter, status: "completed" }),
      Lead.countDocuments({ ...leadFilter, status: "cancelled" }),
      Lead.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Lead.countDocuments({ assignedAt: { $gte: today, $lt: tomorrow } }),
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
        todayLeads,
        todayVisits,
        revenue: revenue[0]?.total || 0,
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

export default router;
