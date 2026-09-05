import assert from "node:assert/strict";
import { test } from "node:test";
import * as v from "valibot";
import { tickets } from "../src/modules/tickets/data/tickets.js";
import { TicketSchema } from "../src/modules/tickets/schema.js";

const butlerTickets = [
  [1, "Aircon leaking on 15/F", "Open", "HVAC", "High", "2026-06-01"],
  [2, "Lobby light flickering", "In Progress", "Electrical", "Medium", "2026-06-03"],
  [3, "Car park gate broken", "Closed", "Security", "High", "2026-05-28"],
  [4, "Water pump noise", "Open", "Plumbing", "Low", "2026-06-10"],
  [5, "Lift button unresponsive", "In Progress", "Lift", "High", "2026-06-12"],
  [6, "Rooftop drain blocked", "Open", "Civil", "Medium", "2026-06-15"],
  [7, "Fire alarm false trigger", "Closed", "Safety", "High", "2026-05-20"],
  [8, "Office AC not cooling", "Open", "HVAC", "Medium", "2026-06-18"],
];

const butlerFields = ["id", "title", "status", "category", "priority", "created"];

test("loads the complete ticket fixture and preserves Butler's records", () => {
  assert.equal(tickets.length, 72);

  for (const expectedTicket of butlerTickets) {
    const ticket = tickets.find(({ id }) => id === expectedTicket[0]);
    assert.ok(ticket);
    assert.deepEqual(
      butlerFields.map((field) => ticket[field]),
      expectedTicket,
    );
  }
});

test("rejects ticket fields outside the data contract", () => {
  const result = v.safeParse(TicketSchema, {
    ...tickets[0],
    reporter: "Tenant",
  });

  assert.equal(result.success, false);
});

test("keeps fixture relationships consistent", () => {
  assert.equal(new Set(tickets.map(({ id }) => id)).size, tickets.length);

  for (const ticket of tickets) {
    assert.ok(ticket.created <= ticket.updated);

    let previousEventDate = ticket.created;

    for (const event of ticket.events) {
      assert.ok(event.at >= ticket.created && event.at <= ticket.updated);
      assert.ok(event.at >= previousEventDate);
      previousEventDate = event.at;
    }

    assert.equal(ticket.events.at(-1)?.at, ticket.updated);
  }
});
