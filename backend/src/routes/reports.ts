import express, { Request, Response } from "express";
import Lead from "../models/Lead";
import LeadStatus from "../models/LeadStatus";
import Job from "../models/Job";
import Payment from "../models/Payment";
import Staff from "../models/Staff";
import { protect, restrictTo, isStaffRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

import { staffHideOldCompleted } from "../utils/staffVisibility";
const router = express.Router();

const dateRange = (from?: string, to?: string) => {
  const range: any = {};
  if (from) range.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    if (!/T|:/.test(to)) end.setDate(end.getDate() + 1);
    range.$lt = end;
  }
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

    if (req.user && isStaffRole(req.user.role)) {
      const technicianStaff = await Staff.findOne({ user: req.user._id });
      if (technicianStaff) {
        staffFilter = { assignedStaff: technicianStaff._id, ...staffHideOldCompleted() };
      }
    }

    const statuses = await LeadStatus.find({ isActive: true }).sort({ order: 1 });
    const statusCountPromises = statuses.map((s) =>
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: s.name })
    );

    const [todayLeads, todayVisits, revenue, statusCounts] = await Promise.all([
      Lead.countDocuments({ ...leadFilter, ...staffFilter, createdAt: Object.keys(dateFilter).length ? dateFilter : { $gte: today, $lt: tomorrow } }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, assignedAt: { $gte: today, $lt: tomorrow } }),
      Payment.aggregate([{ $match: { status: { $ne: "pending" }, ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Promise.all(statusCountPromises),
    ]);

    const statusData: Record<string, number> = {};
    statuses.forEach((s, i) => {
      statusData[s.name] = statusCounts[i] || 0;
    });
    if (Object.keys(staffFilter).length) {
      const mine = { ...leadFilter, ...staffFilter };
      [statusData.new, statusData.pending, statusData.accepted, statusData.completed] = await Promise.all([
        Lead.countDocuments({ ...mine, status: "assigned" }),
        Lead.countDocuments({ ...mine, status: { $nin: ["cancelled"] } }),
        Lead.countDocuments({ ...mine, status: { $nin: ["new", "assigned", "cancelled"] } }),
        Lead.countDocuments({ ...mine, status: { $in: ["completed", "closed"] } }),
      ]);
    }

    const totalLeads = await Lead.countDocuments({ ...leadFilter, ...staffFilter });
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const openUnassigned = { ...leadFilter, ...staffFilter, assignedStaff: null, status: { $nin: ["closed", "cancelled", "completed"] } };
    const assignedAny = { ...leadFilter, ...staffFilter, assignedStaff: { $ne: null } };
    const [newLeads, assignedLeads, acceptedLeads, completedLeads] = await Promise.all([
      Lead.countDocuments(Object.keys(dateFilter).length ? openUnassigned : { ...openUnassigned, createdAt: { $gte: cutoff } }),
      Lead.countDocuments({ ...assignedAny, status: { $nin: ["closed", "cancelled"] } }),
      Lead.countDocuments({ ...assignedAny, status: { $nin: ["new", "assigned", "closed", "cancelled"] } }),
      Lead.countDocuments({ ...leadFilter, ...staffFilter, status: "completed" }),
    ]);

    res.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        pendingLeads: assignedLeads,
        assignedLeads,
        acceptedLeads,
        completedLeads,
        todayLeads,
        todayVisits,
        revenue: (revenue as any)?.[0]?.total || 0,
        statuses,
        statusData,
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

    const staffList = await Staff.find({ isActive: { $ne: false } }).select("_id name employeeId");
    const performance = await Promise.all(
      staffList.map(async (s) => {
        const mine = { ...leadFilter, assignedStaff: s._id };
        const [assigned, accepted, completed, closed, cancelled] = await Promise.all([
          Lead.countDocuments(mine),
          Lead.countDocuments({ ...mine, status: { $nin: ["new", "assigned", "cancelled"] } }),
          Lead.countDocuments({ ...mine, status: "completed" }),
          Lead.countDocuments({ ...mine, status: "closed" }),
          Lead.countDocuments({ ...mine, status: "cancelled" }),
        ]);
        const jobs = await Job.find({ staff: s._id, ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) }).select("billAmount receivedAmount");
        const bill = jobs.reduce((t, j) => t + (j.billAmount || 0), 0);
        const received = jobs.reduce((t, j) => t + (j.receivedAmount || 0), 0);
        return { staffId: s.employeeId, name: s.name, assigned, accepted, completed, closed, cancelled, bill, received, pending: Math.max(0, bill - received) };
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

    const jobMatch = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
    const jobTotals = await Job.aggregate([{ $match: jobMatch }, { $group: { _id: null, bill: { $sum: "$billAmount" }, received: { $sum: "$receivedAmount" } } }]);
    const bill = jobTotals[0]?.bill || 0;
    const received = jobTotals[0]?.received || 0;
    res.json({ success: true, data: { byMode, byStatus, total: total[0]?.total || 0, bill, received, pending: Math.max(0, bill - received) } });
  })
);

router.get(
  "/pending-payments",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const dateFilter = dateRange(from as string | undefined, to as string | undefined);
    const all = await Job.find({ billAmount: { $gt: 0 }, ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) })
      .populate("lead", "customerName mobile leadId")
      .populate("staff", "name employeeId")
      .sort({ updatedAt: -1 });
    const jobs = all
      .filter((j) => (j.billAmount || 0) - (j.receivedAmount || 0) > 0)
      .map((j) => ({ ...j.toObject(), pendingAmount: (j.billAmount || 0) - (j.receivedAmount || 0) }));
    res.json({ success: true, count: jobs.length, data: jobs });
  })
);

export default router;
