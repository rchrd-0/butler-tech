import * as v from "valibot";
import { TicketsSchema } from "../schema.js";
import ticketData from "./tickets.json" with { type: "json" };

export const tickets = v.parse(TicketsSchema, ticketData);
