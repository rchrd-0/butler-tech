import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import app from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve, reject) => {
    server = app.listen(0, "127.0.0.1", (error) => (error ? reject(error) : resolve()));
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (!server?.listening) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("lists all tickets", async () => {
  const response = await fetch(`${baseUrl}/api/tickets`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.length, 72);
});

test("combines ticket filters with AND semantics", async () => {
  const response = await fetch(`${baseUrl}/api/tickets?status=Open&category=HVAC&priority=High`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.length > 0);
  assert.ok(
    body.every(
      ({ status, category, priority }) =>
        status === "Open" && category === "HVAC" && priority === "High",
    ),
  );
});

test("rejects malformed filters and ticket IDs", async () => {
  const invalidRequests = [
    { url: `${baseUrl}/api/tickets?status=Pending`, field: "status" },
    { url: `${baseUrl}/api/tickets?sort=created`, field: "sort" },
    { url: `${baseUrl}/api/tickets/not-a-number`, field: "id" },
  ];

  for (const { url, field } of invalidRequests) {
    const response = await fetch(url);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.message, "Invalid request");
    assert.ok(body.errors[field]?.length > 0);
  }
});

test("returns a ticket by ID and reports an unknown ID", async () => {
  const ticketResponse = await fetch(`${baseUrl}/api/tickets/1`);
  const ticket = await ticketResponse.json();

  assert.equal(ticketResponse.status, 200);
  assert.equal(ticket.id, 1);
  assert.equal(ticket.title, "Aircon leaking on 15/F");

  const missingResponse = await fetch(`${baseUrl}/api/tickets/999`);

  assert.equal(missingResponse.status, 404);
  assert.deepEqual(await missingResponse.json(), { message: "Ticket not found" });
});
