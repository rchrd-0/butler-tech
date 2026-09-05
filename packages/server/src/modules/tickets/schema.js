import * as v from "valibot";

export const TicketStatus = v.picklist(["Open", "In Progress", "Closed"]);

export const TicketCategory = v.picklist([
  "HVAC",
  "Electrical",
  "Security",
  "Plumbing",
  "Lift",
  "Civil",
  "Safety",
]);

export const TicketPriority = v.picklist(["High", "Medium", "Low"]);

export const TicketEventSchema = v.strictObject({
  at: v.pipe(v.string(), v.isoDate()),
  actor: v.string(),
  note: v.string(),
});

export const TicketSchema = v.strictObject({
  id: v.pipe(v.number(), v.integer(), v.minValue(1)),
  title: v.string(),
  status: TicketStatus,
  category: TicketCategory,
  priority: TicketPriority,
  created: v.pipe(v.string(), v.isoDate()),
  location: v.string(),
  updated: v.pipe(v.string(), v.isoDate()),
  assignee: v.nullable(v.string()),
  events: v.array(TicketEventSchema),
});

export const TicketsSchema = v.array(TicketSchema);
