import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveTicketFreshness,
  formatRelativeDays,
  formatTicketDate,
  getAgeSeamPercentage,
} from "#/lib/ticket-freshness.js";

const referenceDate = new Date(2026, 8, 5, 12);

test("derives ticket age and activity in calendar days", () => {
  const freshness = deriveTicketFreshness(
    {
      status: "Open",
      created: "2026-06-01",
      updated: "2026-09-02",
    },
    referenceDate,
  );

  assert.deepEqual(freshness, {
    ageDays: 96,
    activityDays: 3,
    stale: false,
  });
});

test("marks unresolved tickets stale at fourteen days but never closed tickets", () => {
  const openTicket = {
    status: "Open",
    created: "2026-08-01",
    updated: "2026-08-22",
  };

  assert.equal(deriveTicketFreshness(openTicket, referenceDate).stale, true);
  assert.equal(
    deriveTicketFreshness({ ...openTicket, updated: "2026-08-23" }, referenceDate).stale,
    false,
  );
  assert.equal(
    deriveTicketFreshness({ ...openTicket, status: "Closed" }, referenceDate).stale,
    false,
  );
});

test("formats recency labels and clamps the ninety-day age seam", () => {
  assert.equal(formatTicketDate("2026-09-05"), "05 Sept 2026");
  assert.equal(formatRelativeDays(0), "today");
  assert.equal(formatRelativeDays(1), "1d ago");
  assert.equal(formatRelativeDays(12), "12d ago");
  assert.equal(getAgeSeamPercentage(0), 2);
  assert.equal(getAgeSeamPercentage(45), 50);
  assert.equal(getAgeSeamPercentage(120), 100);
});
