import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import Lead from "../models/Lead";
import Company from "../models/Company";
import { protect, restrictTo } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.post(
  "/send-followups",
  protect,
  restrictTo("superadmin", "admin", "manager", "technician"),
  asyncHandler(async (_req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leads = await Lead.find({
      followUpDate: { $gte: today, $lt: tomorrow },
    }).populate("assignedStaff", "name email mobile");

    if (!leads.length) {
      res.json({ success: true, message: "No follow-ups today", count: 0 });
      return;
    }

    const company = await Company.findOne();
    const smtp = company?.emailSmtp;

    let sent = 0;
    if (smtp?.host && smtp?.user && smtp?.pass) {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port || 587,
        secure: smtp.secure || false,
        auth: { user: smtp.user, pass: smtp.pass },
      });

      for (const lead of leads) {
        const staffEmail = (lead.assignedStaff as any)?.email || smtp.user;
        if (!staffEmail) continue;
        await transporter.sendMail({
          from: `"${company?.name || "ESCM"}" <${smtp.user}>`,
          to: staffEmail,
          subject: `Follow-up Reminder: ${lead.customerName}`,
          text: `Reminder to follow up with ${lead.customerName} (${lead.mobile}). Note: ${lead.followUpNote || "N/A"}`,
        });
        sent++;
      }
    }

    res.json({ success: true, message: "Reminders sent", count: leads.length, sent });
  })
);

export default router;
