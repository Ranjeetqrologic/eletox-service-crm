import nodemailer from "nodemailer";
import Company from "../models/Company";

type Smtp = { host: string; port: number; user: string; pass: string; secure: boolean; from: string };

export const getSmtpConfig = async (): Promise<Smtp | null> => {
  const company = await Company.findOne().select("emailSmtp name");
  const s = company?.emailSmtp;
  if (s?.host && s?.user && s?.pass) {
    return { host: s.host, port: s.port || 587, user: s.user, pass: s.pass, secure: !!s.secure, from: `"${company?.name || "Eletox"}" <${s.user}>` };
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      secure: process.env.SMTP_SECURE === "true",
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    };
  }
  return null;
};

export const isMailConfigured = async () => !!(await getSmtpConfig());

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  const cfg = await getSmtpConfig();
  if (!cfg) throw new Error("SMTP not configured");
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure || cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  await transporter.sendMail({ from: cfg.from, to, subject, text, html });
};
