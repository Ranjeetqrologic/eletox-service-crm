import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error("FATAL: JWT_SECRET missing or too short in .env");
  process.exit(1);
}

const app: Application = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "https://eletox.com,https://www.eletox.com").split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(
  "/uploads",
  (_req, res, next) => { res.setHeader("Content-Disposition", "inline"); res.setHeader("X-Content-Type-Options", "nosniff"); next(); },
  express.static(path.join(process.cwd(), "uploads"), { index: false, dotfiles: "deny" })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use(morgan("dev"));

connectDB();
seedLeadStatuses().catch((err) => console.error("Seed failed:", err));
console.log("Server config loaded, routes mounted");

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
