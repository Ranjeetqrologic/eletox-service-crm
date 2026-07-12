import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db";

import authRoutes from "./routes/auth";
import staffRoutes from "./routes/staff";
import leadRoutes from "./routes/leads";
import jobRoutes from "./routes/jobs";
import invoiceRoutes from "./routes/invoices";
import paymentRoutes from "./routes/payments";
import reportRoutes from "./routes/reports";
import settingRoutes from "./routes/settings";
import publicRoutes from "./routes/public";
import attendanceRoutes from "./routes/attendance";

import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/attendance", attendanceRoutes);

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
