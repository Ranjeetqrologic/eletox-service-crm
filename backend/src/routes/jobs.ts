import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Job from "../models/Job";
import Lead from "../models/Lead";
import Staff from "../models/Staff";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadPhotos, getFileUrl } from "../middleware/upload";

const router = express.Router();

const photoFields = ["beforePhotos", "workingPhotos", "afterPhotos"];

const getPhotoArrays = (files: Express.Multer.File[]) => {
  const result: Record<string, string[]> = { beforePhotos: [], workingPhotos: [], afterPhotos: [], videos: [] };
  files.forEach((file) => {
    if (photoFields.includes(file.fieldname)) result[file.fieldname].push(getFileUrl(file));
    if (file.mimetype.startsWith("video")) result.videos.push(getFileUrl(file));
  });
  return result;
};

router.get(
  "/",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { status, lead, staff } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (lead) filter.lead = lead;
    if (staff) filter.staff = staff;

    if (req.user?.role === "technician") {
      const technicianStaff = await Staff.findOne({ user: req.user._id });
      if (technicianStaff) filter.staff = technicianStaff._id;
    }

    const jobs = await Job.find(filter)
      .populate("lead", "customerName mobile address city status leadId")
      .populate("staff", "name mobile employeeId")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  })
);

router.get(
  "/:id",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id)
      .populate("lead", "customerName mobile address city lat lng status leadId")
      .populate("staff", "name mobile employeeId");
    if (!job) throw new AppError("Job not found", 404);
    res.json({ success: true, data: job });
  })
);

router.get(
  "/lead/:leadId",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findOne({ lead: req.params.leadId })
      .populate("lead", "customerName mobile address city lat lng status leadId")
      .populate("staff", "name mobile employeeId");
    if (!job) throw new AppError("Job not found", 404);
    res.json({ success: true, data: job });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager", "technician"),
  [body("lead").notEmpty(), body("staff").notEmpty()],
  asyncHandler(async (req: Request, res: Response) => {
    const lead = await Lead.findById(req.body.lead);
    if (!lead) throw new AppError("Lead not found", 404);

    const existingJob = await Job.findOne({ lead: req.body.lead });
    if (existingJob) throw new AppError("Job already exists for this lead", 400);

    const job = await Job.create({
      lead: req.body.lead,
      staff: req.body.staff,
      status: "started",
      startedAt: new Date(),
    });

    lead.status = "working";
    lead.startedAt = new Date();
    await lead.save();

    res.status(201).json({ success: true, data: job });
  })
);

router.put(
  "/:id/accept",
  protect,
  restrictTo("technician", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);

    job.status = "accepted";
    job.acceptedAt = new Date();
    await job.save();

    await Lead.findByIdAndUpdate(job.lead, { status: "accepted", acceptedAt: new Date() });
    res.json({ success: true, data: job });
  })
);

router.put(
  "/:id/checkin",
  protect,
  restrictTo("technician", "admin", "manager"),
  [body("lat").optional(), body("lng").optional(), body("address").optional()],
  asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);

    job.checkIn = { ...req.body, time: new Date() };
    job.status = "working";
    await job.save();

    await Lead.findByIdAndUpdate(job.lead, { status: "working" });
    res.json({ success: true, data: job });
  })
);

router.put(
  "/:id/report",
  protect,
  restrictTo("technician", "admin", "manager"),
  uploadPhotos,
  asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);

    const files = (req.files as Express.Multer.File[]) || [];
    const photos = getPhotoArrays(files);

    job.beforePhotos.push(...photos.beforePhotos);
    job.workingPhotos.push(...photos.workingPhotos);
    job.afterPhotos.push(...photos.afterPhotos);
    job.videos.push(...photos.videos);

    const updateFields = [
      "partsUsed",
      "expenses",
      "customerRemarks",
      "customerSignature",
      "technicianSignature",
      "workDescription",
      "gasFilled",
      "repairNotes",
      "billAmount",
      "receivedAmount",
      "paymentMode",
      "pendingAmount",
      "customerFeedback",
      "rating",
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) (job as any)[field] = req.body[field];
    });

    if (req.body.status === "completed") {
      job.status = "completed";
      job.completedAt = new Date();
      await Lead.findByIdAndUpdate(job.lead, { status: "completed", completedAt: new Date() });
    }

    await job.save();
    res.json({ success: true, data: job });
  })
);

router.put(
  "/:id/checkout",
  protect,
  restrictTo("technician", "admin", "manager"),
  [body("lat").optional(), body("lng").optional(), body("address").optional()],
  asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);

    job.checkOut = { ...req.body, time: new Date() };
    await job.save();
    res.json({ success: true, data: job });
  })
);

export default router;
