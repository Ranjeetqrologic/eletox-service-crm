import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Service from "../models/Service";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { uploadServiceImage, getFileUrl } from "../middleware/upload";

const router = express.Router();

const parseJsonFields = (body: any) => {
  for (const k of ["content", "packages"]) {
    if (typeof body[k] === "string") {
      try { body[k] = JSON.parse(body[k]); } catch { delete body[k]; }
    }
  }
  if (body.visitCharge === "") delete body.visitCharge;
  return body;
};

router.get(
  "/public",
  asyncHandler(async (_req: Request, res: Response) => {
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, count: services.length, data: services });
  })
);

router.get(
  "/public/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) throw new AppError("Service not found", 404);
    res.json({ success: true, data: service });
  })
);

router.get(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (_req: Request, res: Response) => {
    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, count: services.length, data: services });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadServiceImage,
  [
    body("title").notEmpty(),
    body("slug").notEmpty(),
    body("shortDesc").notEmpty(),
    body("description").notEmpty(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const existing = await Service.findOne({ slug: req.body.slug });
    if (existing) throw new AppError("Service slug already exists", 400);

    const body = parseJsonFields({ ...req.body });
    if (req.file) body.image = getFileUrl(req.file);

    const service = await Service.create(body);
    res.status(201).json({ success: true, data: service });
  })
);

router.put(
  "/:id",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadServiceImage,
  asyncHandler(async (req: Request, res: Response) => {
    const body = parseJsonFields({ ...req.body });
    delete body._id;
    if (req.file) body.image = getFileUrl(req.file);
    const service = await Service.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!service) throw new AppError("Service not found", 404);
    res.json({ success: true, data: service });
  })
);

router.post(
  "/upload-image",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  uploadServiceImage,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new AppError("No image uploaded", 400);
    res.json({ success: true, url: getFileUrl(req.file) });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("superadmin", "admin", "manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) throw new AppError("Service not found", 404);
    res.json({ success: true, message: "Service deleted" });
  })
);

export default router;
