import { Router } from "express";
import { validate } from "#/lib/validate.js";
import { tickets } from "#/modules/tickets/data/tickets.js";
import { TicketFiltersSchema, TicketParamsSchema } from "#/modules/tickets/schema.js";

const ticketRouter = Router();

ticketRouter.use((req, _res, next) => {
  req.log.set({ module: "tickets" });
  next();
});

ticketRouter.get("/", validate("query", TicketFiltersSchema), (req, res) => {
  req.log.set({ operation: "tickets.list" });

  const { status, category, priority } = res.locals.validated;

  const matchingTickets = tickets.filter(
    (ticket) =>
      (!status || ticket.status === status) &&
      (!category || ticket.category === category) &&
      (!priority || ticket.priority === priority),
  );

  res.json(matchingTickets);
});

ticketRouter.get("/:id", validate("params", TicketParamsSchema), (req, res) => {
  const { id } = res.locals.validated;

  req.log.set({
    operation: "tickets.get",
    ticketId: id,
  });

  const ticket = tickets.find((candidate) => candidate.id === id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  res.json(ticket);
});

export default ticketRouter;
