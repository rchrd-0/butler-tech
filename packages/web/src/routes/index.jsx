import { createFileRoute, useRouter } from "@tanstack/react-router";
import { TicketTable } from "#/components/tickets/ticket-table";
import { Button } from "#/components/ui/button";

async function loadTickets({ abortController }) {
  const response = await fetch("/api/tickets", {
    signal: abortController.signal,
  });

  if (!response.ok) {
    throw new Error("Could not load tickets");
  }

  return response.json();
}

export const Route = createFileRoute("/")({
  loader: loadTickets,
  pendingComponent: TicketsPending,
  errorComponent: TicketsError,
  component: TicketsPage,
});

function TicketsPage() {
  const tickets = Route.useLoaderData();

  return (
    <main>
      <h1>Maintenance tickets</h1>
      <p>{tickets.length} tickets</p>
      <TicketTable tickets={tickets} />
    </main>
  );
}

function TicketsPending() {
  return (
    <main>
      <h1>Maintenance tickets</h1>
      <p role="status">Loading tickets…</p>
    </main>
  );
}

function TicketsError({ error }) {
  const router = useRouter();
  const retry = () => router.invalidate();

  return (
    <main>
      <h1>Maintenance tickets</h1>
      <p role="alert">{error.message}</p>
      <Button onClick={retry}>Try again</Button>
    </main>
  );
}
