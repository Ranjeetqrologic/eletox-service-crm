import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Lead from "../models/Lead";
import Job from "../models/Job";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadSingle, uploadPhotos } from "../middleware/upload";

const router = express.Router();

const generateLeadId = () => {
  return "LEAD" + Date.now().toString(36).toUpperCase();
};

router.get(
  "/",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { status, source, staff, search, from, to } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (staff) filter.assignedStaff = staff;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    if (req.user?.role === "technician") {
      const technicianStaff = await (await import("../models/Staff")).default.findOne({ user: req.user._id });
      if (technicianStaff) filter.assignedStaff = technicianStaff._id;
    }

    if (search) {
      const term = search as string;
      filter.$or = [
        { customerName: { $regex: term, $options: "i" } },
        { mobile: { $regex: term, $options: "i" } },
        { leadId: { $regex: term, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("assignedStaff", "name mobile employeeId")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leads.length, data: leads });
  })
);

router.get(
  "/:id",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedStaff", "name mobile employeeId lat lng")
      .populate("createdBy", "name email");
    if (!lead) throw new AppError("Lead not found", 404);
    res.json({ success: true, data: lead });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadPhotos,
  [
    body("customerName").notEmpty(),
    body("mobile").notEmpty(),
    body("address").notEmpty(),
    body("city").notEmpty(),
    body("service").notEmpty(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const files = (req.files as Express.Multer.File[]) || [];
    const images = files.map((f) => f.path);

    const lead = await Lead.create({
      ...req.body,
      leadId: generateLeadId(),
      images,
      createdBy: req.user?._id,
    });

    res.status(201).json({ success: true, data: lead });
  })
);

router.post(
  "/public-inquiry",
  uploadSingle,
  [
    body("customerName").notEmpty(),
    body("mobile").notEmpty().isMobilePhone("any"),
    body("address").notEmpty(),
    body("city").notEmpty(),
    body("service").notEmpty(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const file = req.file as Express.Multer.File;
    const lead = await Lead.create({
      ...req.body,
      leadId: generateLeadId(),
      source: "website",
      images: file ? [file.path] : [],
    });

    res.status(201).json({ success: true, message: "Inquiry submitted. We will contact you shortly.", data: lead });
  })
);

router.put(
  "/:id",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadPhotos,
  asyncHandler(async (req: Request, res: Response) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new AppError("Lead not found", 404);

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length) lead.images.push(...files.map((f) => f.path));

    Object.assign(lead, req.body);
    await lead.save();
    res.json({ success: true, data: lead });
  })
);

router.put(
  "/:id/assign",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  [body("staffId").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new AppError("Lead not found", 404);

    lead.assignedStaff = req.body.staffId;
    lead.status = "assigned";
    lead.assignedAt = new Date();
    await lead.save();

    res.json({ success: true, message: "Lead assigned", data: lead });
  })
);

router.put(
  "/:id/status",
  protect,
  [body("status").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new AppError("Lead not found", 404);

    const allowed = ["new", "assigned", "accepted", "on_the_way", "reached", "working", "need_parts", "pending", "follow_up", "completed", "cancelled", "closed"];
    if (!allowed.includes(req.body.status)) throw new AppError("Invalid status", 400);

    lead.status = req.body.status;
    if (req.body.status === "accepted") lead.acceptedAt = new Date();
    if (req.body.status === "working") lead.startedAt = new Date();
    if (req.body.status === "completed") lead.completedAt = new Date();
    if (req.body.status === "closed") lead.closedAt = new Date();
    if (req.body.status === "cancelled") lead.cancelledReason = req.body.reason || "";

    await lead.save();
    res.json({ success: true, data: lead });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin"),
  asyncHandler(async (req: Request, res: Response) => {
    await Lead.findByIdAndDelete(req.params.id);
    await Job.deleteOne({ lead: req.params.id });
    res.json({ success: true, message: "Lead deleted" });
  })
);

export default router;
