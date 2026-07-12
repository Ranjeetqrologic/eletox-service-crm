import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Invoice from "../models/Invoice";
import Lead from "../models/Lead";
import Company from "../models/Company";
import PDFDocument from "pdfkit";
import { protect, restrictTo } from "../middleware/auth";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

const generateInvoiceNumber = () => {
  return "INV-" + Date.now().toString(36).toUpperCase();
};

router.get(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  asyncHandler(async (req: Request, res: Response) => {
    const invoices = await Invoice.find()
      .populate("lead", "customerName mobile address city")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, data: invoices });
  })
);

router.get(
  "/:id",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const invoice = await Invoice.findById(req.params.id).populate("lead", "customerName mobile address city");
    if (!invoice) throw new AppError("Invoice not found", 404);
    res.json({ success: true, data: invoice });
  })
);

router.post(
  "/",
  protect,
  restrictTo("superadmin", "admin", "manager", "account"),
  [body("lead").notEmpty(), body("items").isArray({ min: 1 })],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const lead = await Lead.findById(req.body.lead);
    if (!lead) throw new AppError("Lead not found", 404);

    const company = await Company.findOne();
    const isGst = req.body.isGst || false;
    const items = req.body.items.map((item: any) => {
      const amount = item.quantity * item.rate;
      const gstRate = isGst ? item.gstRate || 18 : 0;
      return { ...item, amount, gstRate };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const gstAmount = items.reduce((sum: number, item: any) => sum + (item.amount * item.gstRate) / 100, 0);
    const total = subtotal + gstAmount;

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      lead: lead._id,
      customerName: lead.customerName,
      customerMobile: lead.mobile,
      customerAddress: lead.address,
      items,
      subtotal,
      gstAmount,
      total,
      isGst,
      gstNumber: company?.gstNumber || req.body.gstNumber,
      companyName: company?.name,
      companyAddress: company?.address,
      companyPhone: company?.phone,
      companyEmail: company?.email,
      companyLogo: company?.logo,
      upiId: company?.upiId,
      qrCode: company?.qrCode,
      createdBy: req.user?._id,
    });

    res.status(201).json({ success: true, data: invoice });
  })
);

router.get(
  "/:id/pdf",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const invoice = await Invoice.findById(req.params.id).populate("lead", "customerName mobile address city");
    if (!invoice) throw new AppError("Invoice not found", 404);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(invoice.companyName || "Eletox AC Services", 50, 50);
    doc.fontSize(12).text(invoice.companyAddress || "");
    doc.text(`Phone: ${invoice.companyPhone || ""} | Email: ${invoice.companyEmail || ""}`);
    doc.moveDown();
    doc.fontSize(16).text(`Invoice #${invoice.invoiceNumber}`);
    doc.fontSize(12).text(`Date: ${invoice.createdAt.toDateString()}`);
    doc.moveDown();
    doc.text(`Bill To: ${invoice.customerName}`);
    doc.text(`Mobile: ${invoice.customerMobile}`);
    doc.text(`Address: ${invoice.customerAddress || ""}`);
    if (invoice.isGst) doc.text(`GST: ${invoice.gstNumber || ""}`);
    doc.moveDown();

    doc.text("Items");
    invoice.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.description} - Qty: ${item.quantity} x Rate: ${item.rate} = ${item.amount}`);
    });
    doc.moveDown();
    doc.text(`Subtotal: ${invoice.subtotal.toFixed(2)}`);
    if (invoice.isGst) doc.text(`GST: ${invoice.gstAmount.toFixed(2)}`);
    doc.fontSize(14).text(`Total: ${invoice.total.toFixed(2)}`, { underline: true });
    if (invoice.upiId) doc.text(`UPI: ${invoice.upiId}`);

    doc.end();
  })
);

export default router;
