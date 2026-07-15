import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db";
import { seedLeadStatuses } from "./config/seed";

import authRoutes from "./routes/auth";
import staffRoutes from "./routes/staff";
import roleRoutes from "./routes/roles";
import leadRoutes from "./routes/leads";
import leadStatusRoutes from "./routes/leadStatus";
import jobRoutes from "./routes/jobs";
import invoiceRoutes from "./routes/invoices";
import paymentRoutes from "./routes/payments";
import reportRoutes from "./routes/reports";
import serviceRoutes from "./routes/services";
import settingRoutes from "./routes/settings";
import publicRoutes from "./routes/public";
import remindersRoutes from "./routes/reminders";
import bannerRoutes from "./routes/banners";
import galleryRoutes from "./routes/gallery";

import { errorHandler } from "./middleware/errorHandler";
import path from "path";

const app: Application = express();

app.use(cors());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

connectDB();
seedLeadStatuses().catch((err) => console.error("Seed failed:", err));

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/lead-status", leadStatusRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  errorHandler(err, res);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ESCM server running on http://localhost:${PORT}`);
});

export default app;
