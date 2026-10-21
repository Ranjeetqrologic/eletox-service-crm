import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Job from "../models/Job";
import Lead from "../models/Lead";
import Staff from "../models/Staff";
import Payment from "../models/Payment";
import { generateLeadId } from "../utils/leadId";
import { protect, restrictTo, isStaffRole } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { staffHideOldCompleted } from "../utils/staffVisibility";
import { uploadReportPhotos, getFileUrl } from "../middleware/upload";

const router = express.Router();

const photoFields = ["beforePhotos", "workingPhotos", "afterPhotos", "billPhotos"];

const getPhotoArrays = (files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }) => {
  const result: Record<string, string[]> = { beforePhotos: [], workingPhotos: [], afterPhotos: [], billPhotos: [], videos: [] };
  const allFiles = Array.isArray(files) ? files : Object.values(files || {}).flat();
  allFiles.forEach((file) => {
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

    if (req.user && isStaffRole(req.user.role)) {
      const technicianStaff = await Staff.findOne({ user: req.user._id });
      if (technicianStaff) filter.staff = technicianStaff._id;
      Object.assign(filter, staffHideOldCompleted());
    }

    const jobs = await Job.find(filter)
      .populate("lead", "customerName mobile address city status leadId machineSerialNo followUpDate followUpNote createdAt locationLink subService service")
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
      .populate("lead", "customerName mobile address city lat lng status leadId machineSerialNo followUpDate followUpNote createdAt locationLink subService service")
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
      .populate("lead", "customerName mobile address city lat lng status leadId machineSerialNo followUpDate followUpNote createdAt locationLink subService service")
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
  restrictTo("superadmin", "technician", "admin", "manager"),
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
  restrictTo("superadmin", "technician", "admin", "manager"),
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

router.post(
  "/:id/photos",
  protect,
  restrictTo("superadmin", "technician", "admin", "manager"),
  uploadReportPhotos,
  asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);
    const photos = getPhotoArrays(req.files);
    job.beforePhotos.push(...photos.beforePhotos);
    job.workingPhotos.push(...photos.workingPhotos);
    job.afterPhotos.push(...photos.afterPhotos);
    job.videos.push(...photos.videos);
    await job.save();
    res.json({ success: true, data: job });
  })
);

router.delete(
  "/:id/photos",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const { field, url } = req.body as { field: string; url: string };
    if (!["beforePhotos", "workingPhotos", "afterPhotos", "videos"].includes(field)) throw new AppError("Invalid field", 400);
    const job = await Job.findByIdAndUpdate(req.params.id, { $pull: { [field]: url } }, { new: true });
    if (!job) throw new AppError("Job not found", 404);
    res.json({ success: true, data: job });
  })
);

router.put(
  "/:id/report",
  protect,
  restrictTo("superadmin", "technician", "admin", "manager"),
  uploadReportPhotos,
  asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);

    const photos = getPhotoArrays(req.files);

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
      "adminRemark",
      "machineSerialNo",
      "billAmount",
      "receivedAmount",
      "paymentMode",
      "pendingAmount",
      "customerFeedback",
      "rating",
      "clientExperience",
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) (job as any)[field] = req.body[field];
    });

    if (req.body.machineSerialNo !== undefined) {
      await Lead.findByIdAndUpdate(job.lead, { machineSerialNo: req.body.machineSerialNo });
    }

    if (req.body.servicesDone !== undefined) {
      const raw = req.body.servicesDone;
      const list: string[] = Array.isArray(raw) ? raw : typeof raw === "string" && raw.startsWith("[") ? JSON.parse(raw) : raw ? [raw] : [];
      job.servicesDone = list.map((s) => String(s).trim()).filter(Boolean);
    }

    if (req.body.status === "completed") {
      job.status = "completed";
      job.completedAt = new Date();
      await Lead.findByIdAndUpdate(job.lead, { status: "completed", completedAt: new Date() });
    } else if (req.body.status === "half_done") {
      job.status = "half_done";
      await Lead.findByIdAndUpdate(job.lead, { status: "half_done" });
    }

    await job.save();
    res.json({ success: true, data: job });
  })
);

router.post(
  "/old-entry",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadReportPhotos,
  asyncHandler(async (req: Request, res: Response) => {
    const b = req.body;
    for (const f of ["customerName", "mobile", "service", "leadDate"]) {
      if (!String(b[f] || "").trim()) throw new AppError(`${f} is required`, 400);
    }
    const when = new Date(String(b.leadDate).length <= 10 ? `${b.leadDate}T12:00:00` : b.leadDate);
    if (isNaN(when.getTime())) throw new AppError("Invalid lead date", 400);

    const technicianType = b.technicianType === "outside" ? "outside" : "office";
    let staffId: any = undefined;
    let outsideName = "";
    if (technicianType === "office") {
      if (!b.staff) throw new AppError("Select office technician", 400);
      const st = await Staff.findById(b.staff);
      if (!st) throw new AppError("Technician not found", 404);
      staffId = st._id;
    } else {
      outsideName = String(b.outsideTechnicianName || "").trim();
      if (!outsideName) throw new AppError("Enter outside technician name", 400);
    }

    const bill = Number(b.billAmount) || 0;
    const received = Number(b.receivedAmount) || 0;

    const lead = await Lead.create({
      leadId: await generateLeadId(),
      customerName: b.customerName,
      mobile: b.mobile,
      address: b.address || "-",
      city: b.city || "Jaipur",
      service: b.service,
      subService: b.subService || undefined,
      problem: b.note || undefined,
      source: "manual",
      status: "closed",
      finalCompleted: true,
      assignedStaff: staffId,
      outsideTechnician: technicianType === "outside" ? outsideName : undefined,
      machineSerialNo: b.machineSerialNo || undefined,
      createdAt: when,
      assignedAt: when,
      completedAt: when,
      closedAt: when,
      createdBy: req.user?._id,
    });

    const photos = getPhotoArrays(req.files);
    const job = await Job.create({
      lead: lead._id,
      staff: staffId,
      outsideTechnician: technicianType === "outside" ? outsideName : undefined,
      closedByAdmin: true,
      status: "completed",
      workingPhotos: photos.workingPhotos,
      billPhotos: photos.billPhotos,
      workDescription: b.workDescription || undefined,
      machineSerialNo: b.machineSerialNo || undefined,
      billAmount: bill,
      receivedAmount: received,
      pendingAmount: Math.max(0, bill - received),
      paymentMode: b.paymentMode || undefined,
      customerFeedback: b.customerFeedback || undefined,
      startedAt: when,
      completedAt: when,
      createdAt: when,
    });

    if (received > 0) {
      await Payment.create({
        lead: lead._id,
        job: job._id,
        amount: received,
        mode: ["cash", "upi", "card", "online"].includes(b.paymentMode) ? b.paymentMode : "cash",
        status: "received",
        receivedBy: req.user?._id,
        notes: "Old data entry",
        createdAt: when,
      });
    }

    res.status(201).json({ success: true, data: { lead, job } });
  })
);

router.post(
  "/admin-close/:leadId",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadReportPhotos,
  asyncHandler(async (req: Request, res: Response) => {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) throw new AppError("Lead not found", 404);
    if (lead.status === "closed") throw new AppError("Lead already closed", 400);

    const technicianType = req.body.technicianType === "outside" ? "outside" : "office";
    let staffId: any = undefined;
    let outsideName = "";
    if (technicianType === "office") {
      if (!req.body.staff) throw new AppError("Select office technician", 400);
      const st = await Staff.findById(req.body.staff);
      if (!st) throw new AppError("Technician not found", 404);
      staffId = st._id;
    } else {
      outsideName = String(req.body.outsideTechnicianName || "").trim();
      if (!outsideName) throw new AppError("Enter outside technician name", 400);
    }

    let job = await Job.findOne({ lead: lead._id });
    if (!job) job = new Job({ lead: lead._id, staff: staffId });
    if (staffId) job.staff = staffId;
    job.outsideTechnician = technicianType === "outside" ? outsideName : undefined;
    job.closedByAdmin = true;

    const photos = getPhotoArrays(req.files);
    job.beforePhotos.push(...photos.beforePhotos);
    job.workingPhotos.push(...photos.workingPhotos);
    job.afterPhotos.push(...photos.afterPhotos);
    job.billPhotos.push(...photos.billPhotos);

    const fields = ["workDescription", "repairNotes", "adminRemark", "machineSerialNo", "billAmount", "receivedAmount", "paymentMode", "customerFeedback", "rating", "clientExperience"];
    fields.forEach((f) => { if (req.body[f] !== undefined && req.body[f] !== "") (job as any)[f] = req.body[f]; });
    if (req.body.servicesDone !== undefined) {
      const raw = req.body.servicesDone;
      const list: string[] = Array.isArray(raw) ? raw : typeof raw === "string" && raw.startsWith("[") ? JSON.parse(raw) : raw ? [raw] : [];
      job.servicesDone = list.map((x) => String(x).trim()).filter(Boolean);
    }
    job.pendingAmount = Math.max(0, (Number(job.billAmount) || 0) - (Number(job.receivedAmount) || 0));
    const now = new Date();
    job.status = "completed";
    job.completedAt = now;
    await job.save();

    if (staffId) lead.assignedStaff = staffId;
    lead.outsideTechnician = technicianType === "outside" ? outsideName : undefined;
    if (req.body.machineSerialNo) lead.machineSerialNo = req.body.machineSerialNo;
    lead.completedAt = now;
    lead.status = "closed";
    lead.closedAt = now;
    lead.finalCompleted = true;
    await lead.save();

    res.json({ success: true, data: { job, lead } });
  })
);

router.put(
  "/:id/checkout",
  protect,
  restrictTo("superadmin", "technician", "admin", "manager"),
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
