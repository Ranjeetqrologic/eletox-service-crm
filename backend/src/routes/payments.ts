import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Payment from "../models/Payment";
import Lead from "../models/Lead";
import Job from "../models/Job";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const { lead, mode } = req.query;
    const filter: any = {};
    if (lead) filter.lead = lead;
    if (mode) filter.mode = mode;

    const payments = await Payment.find(filter)
      .populate("lead", "customerName leadId")
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  })
);

router.get(
  "/history",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const jobs = await Job.find({})
      .populate("lead", "customerName leadId mobile service")
      .populate("staff", "name")
      .sort({ updatedAt: -1 });
    const payments = await Payment.find({}).select("lead amount status");
    const receivedByLead: Record<string, number> = {};
    for (const p of payments) {
      if (p.status === "pending") continue;
      const k = String(p.lead);
      receivedByLead[k] = (receivedByLead[k] || 0) + p.amount;
    }
    const rows = jobs.map((j: any) => {
      const bill = j.billAmount || 0;
      const fromPayments = receivedByLead[String(j.lead?._id || j.lead)] || 0;
      const received = Math.max(j.receivedAmount || 0, fromPayments);
      const expenses = (j.expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
      return {
        _id: j._id,
        jobId: j.jobId,
        lead: j.lead,
        staff: j.staff,
        status: j.status,
        date: j.completedAt || j.updatedAt,
        bill,
        received,
        expenses,
        pending: Math.max(0, bill - received),
      };
    });
    const totals = rows.reduce(
      (t, r) => ({ bill: t.bill + r.bill, received: t.received + r.received, expenses: t.expenses + r.expenses, pending: t.pending + r.pending }),
      { bill: 0, received: 0, expenses: 0, pending: 0 }
    );
    res.json({ success: true, data: rows, totals });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  [
    body("lead").notEmpty(),
    body("amount").isFloat({ min: 0 }),
    body("mode").isIn(["cash", "upi", "card", "online"]),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const lead = await Lead.findById(req.body.lead);
    if (!lead) throw new AppError("Lead not found", 404);

    const payment = await Payment.create({
      ...req.body,
      receivedBy: req.user?._id,
    });

    const job = await Job.findOne({ lead: req.body.lead });
    if (job) {
      job.receivedAmount += Number(req.body.amount);
      job.pendingAmount = Math.max(0, job.billAmount - job.receivedAmount);
      await job.save();
    }

    res.status(201).json({ success: true, data: payment });
  })
);

router.put(
  "/:id",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id);
    if (!payment) throw new AppError("Payment not found", 404);

    const oldAmount = payment.amount;
    Object.assign(payment, req.body);
    await payment.save();

    const job = await Job.findOne({ lead: payment.lead });
    if (job) {
      const diff = Number(req.body.amount || oldAmount) - oldAmount;
      job.receivedAmount += diff;
      job.pendingAmount = Math.max(0, job.billAmount - job.receivedAmount);
      await job.save();
    }

    res.json({ success: true, data: payment });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id);
    if (!payment) throw new AppError("Payment not found", 404);

    const job = await Job.findOne({ lead: payment.lead });
    if (job) {
      job.receivedAmount -= payment.amount;
      job.pendingAmount = Math.max(0, job.billAmount - job.receivedAmount);
      await job.save();
    }

    await payment.deleteOne();
    res.json({ success: true, message: "Payment deleted" });
  })
);

export default router;
