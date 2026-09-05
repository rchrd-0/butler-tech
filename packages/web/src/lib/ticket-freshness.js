const MILLISECONDS_PER_DAY = 86_400_000;
const AGE_SEAM_DAYS = 90;

export const STALE_AFTER_DAYS = 14;

function dateOnlyToDayNumber(date) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MILLISECONDS_PER_DAY;
}

function referenceDateToDayNumber(referenceDate) {
  return (
    Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()) /
    MILLISECONDS_PER_DAY
  );
}

export function daysSince(date, referenceDate = new Date()) {
  return referenceDateToDayNumber(referenceDate) - dateOnlyToDayNumber(date);
}

export function formatRelativeDays(days) {
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export function getAgeSeamPercentage(ageDays) {
  return Math.max(2, Math.min(100, Math.round((ageDays / AGE_SEAM_DAYS) * 100)));
}

export function deriveTicketFreshness(ticket, referenceDate = new Date()) {
  const ageDays = daysSince(ticket.created, referenceDate);
  const activityDays = daysSince(ticket.updated, referenceDate);

  return {
    ageDays,
    activityDays,
    stale: ticket.status !== "Closed" && activityDays >= STALE_AFTER_DAYS,
  };
}

export function deriveTicketsFreshness(tickets, referenceDate = new Date()) {
  return tickets.map((ticket) => ({
    ...ticket,
    freshness: deriveTicketFreshness(ticket, referenceDate),
  }));
}
