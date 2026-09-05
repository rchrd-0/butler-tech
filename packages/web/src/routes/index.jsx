import { createFileRoute, useRouter } from "@tanstack/react-router";
import { TicketFilters } from "#/components/tickets/ticket-filters";
import { TicketTable } from "#/components/tickets/ticket-table";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "#/components/ui/empty";

const ticketFilterValues = {
  status: ["Open", "In Progress", "Closed"],
  category: ["HVAC", "Electrical", "Security", "Plumbing", "Lift", "Civil", "Safety"],
  priority: ["High", "Medium", "Low"],
};

const ticketFilterOptions = Object.fromEntries(
  Object.entries(ticketFilterValues).map(([name, values]) => [
    name,
    [{ label: `All ${name}`, value: null }, ...values.map((value) => ({ label: value, value }))],
  ]),
);

function validateTicketSearch(search) {
  const validatedSearch = {
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  };

  for (const [name, values] of Object.entries(ticketFilterValues)) {
    validatedSearch[name] = values.includes(search[name]) ? search[name] : undefined;
  }

  return validatedSearch;
}

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
  validateSearch: validateTicketSearch,
  loader: loadTickets,
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: TicketsPending,
  errorComponent: TicketsError,
  component: TicketsPage,
});

function TicketsPage() {
  const tickets = Route.useLoaderData();
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();

  const updateFilter = (name, value) => {
    navigate({
      replace: true,
      search: (previous) => ({ ...previous, [name]: value }),
    });
  };

  const clearFilters = () => {
    navigate({ replace: true, search: {} });
  };

  return (
    <TicketsLayout>
      {tickets.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Ledger empty</EmptyTitle>
            <EmptyDescription>No maintenance tickets are available.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <TicketFilters
            filters={filters}
            options={ticketFilterOptions}
            onChange={updateFilter}
            onClear={clearFilters}
          />
          <TicketTable tickets={tickets} filters={filters} />
        </>
      )}
    </TicketsLayout>
  );
}

function TicketsLayout({ children }) {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Maintenance tickets</h1>
      {children}
    </main>
  );
}

function TicketsCentered({ children }) {
  return <div className="flex min-h-0 flex-1 items-center justify-center p-[18px]">{children}</div>;
}

function TicketsPending() {
  return (
    <TicketsLayout>
      <TicketsCentered>
        <p className="font-mono text-[12px] text-muted-foreground" role="status">
          Loading tickets…
        </p>
      </TicketsCentered>
    </TicketsLayout>
  );
}

function TicketsError({ error }) {
  const router = useRouter();
  const retry = () => router.invalidate();

  return (
    <TicketsLayout>
      <TicketsCentered>
        <Alert className="max-w-sm">
          <AlertTitle>Ledger unavailable</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <Button className="mt-2 w-fit" onClick={retry} size="sm" variant="outline">
            Try again
          </Button>
        </Alert>
      </TicketsCentered>
    </TicketsLayout>
  );
}
