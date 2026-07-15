import LeadStatus from "../models/LeadStatus";

const defaultStatuses = [
  { name: "new", label: "New", color: "#6B7280", order: 1, isDefault: true },
  { name: "assigned", label: "Assigned", color: "#EAB308", order: 2 },
  { name: "accepted", label: "Accepted", color: "#3B82F6", order: 3 },
  { name: "on_the_way", label: "On the Way", color: "#8B5CF6", order: 4 },
  { name: "reached", label: "Reached", color: "#F97316", order: 5 },
  { name: "working", label: "Working", color: "#EC4899", order: 6 },
  { name: "half_done", label: "Half Done", color: "#F59E0B", order: 7 },
  { name: "need_parts", label: "Need Parts", color: "#6366F1", order: 8 },
  { name: "pending", label: "Pending", color: "#EF4444", order: 9 },
  { name: "follow_up", label: "Follow Up", color: "#14B8A6", order: 10 },
  { name: "completed", label: "Completed", color: "#22C55E", order: 11 },
  { name: "cancelled", label: "Cancelled", color: "#DC2626", order: 12 },
  { name: "closed", label: "Closed", color: "#4B5563", order: 13 },
];

export const seedLeadStatuses = async () => {
  for (const status of defaultStatuses) {
    const existing = await LeadStatus.findOne({ name: status.name });
    if (!existing) {
      await LeadStatus.create(status);
    }
  }
};
