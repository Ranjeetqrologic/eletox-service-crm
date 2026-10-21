import Lead from "../models/Lead";

export const generateLeadId = async () => {
  const yy = String(new Date().getFullYear()).slice(-2);
  for (let i = 0; i < 20; i++) {
    const id = String(Math.floor(1000 + Math.random() * 9000)) + yy;
    if (!(await Lead.exists({ leadId: id }))) return id;
  }
  return String(Date.now()).slice(-4) + yy;
};
