const STATUS_ORDER = ["Open", "In Progress", "Closed"];
const PRIORITY_ORDER = ["High", "Medium", "Low"];
const STALE_TICKET_LIMIT = 5;
const LOCATION_LIMIT = 6;

export function summarizeTicketOperations(tickets) {
  const statusCounts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  const priorityCounts = Object.fromEntries(PRIORITY_ORDER.map((priority) => [priority, 0]));
  const locationCounts = new Map();
  const staleTickets = [];
  let unassignedCount = 0;

  for (const ticket of tickets) {
    statusCounts[ticket.status] += 1;

    if (ticket.status === "Closed") continue;

    priorityCounts[ticket.priority] += 1;
    locationCounts.set(ticket.location, (locationCounts.get(ticket.location) ?? 0) + 1);

    if (ticket.assignee === null) unassignedCount += 1;
    if (ticket.freshness.stale) staleTickets.push(ticket);
  }

  const locations = Array.from(locationCounts, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, LOCATION_LIMIT);
  const staleCount = staleTickets.length;

  staleTickets.sort((a, b) => b.freshness.activityDays - a.freshness.activityDays || a.id - b.id);

  return {
    unassignedCount,
    staleCount,
    staleTickets: staleTickets.slice(0, STALE_TICKET_LIMIT),
    statuses: STATUS_ORDER.map((name) => ({ name, count: statusCounts[name] })),
    priorities: PRIORITY_ORDER.map((name) => ({ name, count: priorityCounts[name] })),
    locations,
  };
}
