import assert from "node:assert/strict";
import test from "node:test";
import { summarizeTicketOperations } from "#/lib/ticket-operations.js";

function ticket({
  id,
  status,
  priority,
  location,
  assignee = "Technician",
  activityDays = 0,
  stale = false,
}) {
  return {
    id,
    title: `Ticket ${id}`,
    status,
    priority,
    location,
    assignee,
    updated: "2026-09-01",
    freshness: {
      activityDays,
      stale,
    },
  };
}

test("summarizes status and active workload counts", () => {
  const summary = summarizeTicketOperations([
    ticket({ id: 1, status: "Open", priority: "High", location: "Lobby", assignee: null }),
    ticket({ id: 2, status: "In Progress", priority: "Medium", location: "Lobby" }),
    ticket({ id: 3, status: "Closed", priority: "Low", location: "Rooftop", assignee: null }),
  ]);

  assert.deepEqual(summary.statuses, [
    { name: "Open", count: 1 },
    { name: "In Progress", count: 1 },
    { name: "Closed", count: 1 },
  ]);
  assert.deepEqual(summary.priorities, [
    { name: "High", count: 1 },
    { name: "Medium", count: 1 },
    { name: "Low", count: 0 },
  ]);
  assert.equal(summary.unassignedCount, 1);
});

test("returns the five longest-inactive stale tickets", () => {
  const tickets = [20, 70, 16, 40, 30, 60].map((activityDays, index) =>
    ticket({
      id: index + 1,
      status: "Open",
      priority: "Low",
      location: "Plant Room",
      activityDays,
      stale: true,
    }),
  );
  tickets.push(
    ticket({
      id: 7,
      status: "Closed",
      priority: "High",
      location: "Lobby",
      activityDays: 90,
    }),
  );

  const summary = summarizeTicketOperations(tickets);

  assert.equal(summary.staleCount, 6);
  assert.deepEqual(
    summary.staleTickets.map(({ id }) => id),
    [2, 6, 4, 5, 1],
  );
});

test("ranks the six busiest active locations with deterministic ties", () => {
  const locations = ["Rooftop", "Lobby", "Rooftop", "Podium", "Lobby", "Atrium", "Basement", "G/F"];
  const summary = summarizeTicketOperations(
    locations.map((location, index) =>
      ticket({ id: index + 1, status: "Open", priority: "Medium", location }),
    ),
  );

  assert.deepEqual(summary.locations, [
    { name: "Lobby", count: 2 },
    { name: "Rooftop", count: 2 },
    { name: "Atrium", count: 1 },
    { name: "Basement", count: 1 },
    { name: "G/F", count: 1 },
    { name: "Podium", count: 1 },
  ]);
});
