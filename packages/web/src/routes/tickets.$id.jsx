import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { cn } from "cn";
import { TicketStateLine } from "#/components/tickets/ticket-state-line";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "#/components/ui/empty";
import { Separator } from "#/components/ui/separator";
import {
  deriveTicketFreshness,
  formatRelativeDays,
  formatTicketDate,
} from "#/lib/ticket-freshness";

async function loadTicket({ params, abortController }) {
  const response = await fetch(`/api/tickets/${encodeURIComponent(params.id)}`, {
    signal: abortController.signal,
  });

  if (response.status === 400 || response.status === 404) {
    throw notFound();
  }

  if (!response.ok) {
    throw new Error("Could not load ticket record");
  }

  const ticket = await response.json();

  return {
    ...ticket,
    freshness: deriveTicketFreshness(ticket),
  };
}

export const Route = createFileRoute("/tickets/$id")({
  loader: loadTicket,
  staleTime: Number.POSITIVE_INFINITY,
  pendingMs: 250,
  pendingMinMs: 300,
  pendingComponent: TicketRecordPending,
  errorComponent: TicketRecordError,
  notFoundComponent: TicketRecordNotFound,
  component: TicketRecordPage,
});

function TicketRecordPage() {
  const ticket = Route.useLoaderData();

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-[18px] py-7 sm:py-9">
      <article className="mx-auto flex w-full max-w-[1102px] flex-col gap-7">
        <header className="flex max-w-2xl flex-col gap-3">
          <TicketStateLine ticket={ticket} />
          <h1 className="font-heading font-medium text-[30px] leading-[1.12] tracking-[-0.015em] sm:text-[34px]">
            {ticket.title}
          </h1>
        </header>

        <dl className="grid border border-border bg-card sm:grid-cols-2 lg:grid-cols-6">
          <TicketRecordFact label="Raised" mono>
            <time dateTime={ticket.created}>{formatTicketDate(ticket.created)}</time>
          </TicketRecordFact>
          <TicketRecordFact label="Age" mono>
            {ticket.freshness.ageDays} days
          </TicketRecordFact>
          <TicketRecordFact label="Last activity" mono>
            <time dateTime={ticket.updated}>
              {formatTicketDate(ticket.updated)} ·{" "}
              {formatRelativeDays(ticket.freshness.activityDays)}
            </time>
          </TicketRecordFact>
          <TicketRecordFact label="Assigned">
            {ticket.assignee ?? <em className="text-muted-foreground">Unassigned</em>}
          </TicketRecordFact>
          <TicketRecordFact label="Location">{ticket.location}</TicketRecordFact>
          <TicketRecordFact label="Category">{ticket.category}</TicketRecordFact>
        </dl>

        <section aria-labelledby="activity-log-heading">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="label-eyebrow shrink-0 text-[11px]" id="activity-log-heading">
              Activity log
            </h2>
            <Separator />
          </div>
          <ol className="max-w-4xl">
            {ticket.events.map((event, index) => (
              <li
                className="grid grid-cols-[5.5rem_0.75rem_minmax(0,1fr)] gap-x-3"
                key={`${event.at}-${event.actor}-${event.note}`}
              >
                <time
                  className="pt-px text-right font-mono text-[11.5px] text-muted-foreground"
                  dateTime={event.at}
                >
                  {formatTicketDate(event.at)}
                </time>
                <span aria-hidden="true" className="relative flex justify-center">
                  {index < ticket.events.length - 1 ? (
                    <span className="absolute top-2 bottom-0 w-px bg-border" />
                  ) : null}
                  <span className="relative mt-1 size-2 border border-foreground bg-background" />
                </span>
                <div className="min-w-0 pb-6">
                  <p className="label-eyebrow mb-1 text-[10.5px] text-muted-foreground">
                    {event.actor}
                  </p>
                  <p className="text-[14px] leading-relaxed">{event.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </main>
  );
}

function TicketRecordFact({ label, children, mono = false }) {
  return (
    <div className="min-w-0 border-border-subtle border-b p-3 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0">
      <dt className="label-eyebrow mb-1 text-[9.5px] text-muted-foreground">{label}</dt>
      <dd
        className={cn("break-words text-[13px] leading-relaxed", mono && "font-mono text-[11.5px]")}
      >
        {children}
      </dd>
    </div>
  );
}

function TicketRecordState({ children }) {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center px-[18px] py-8">
      {children}
    </main>
  );
}

function TicketRecordPending() {
  return (
    <TicketRecordState>
      <p className="font-mono text-[12px] text-muted-foreground" role="status">
        Loading ticket record…
      </p>
    </TicketRecordState>
  );
}

function TicketRecordError({ error }) {
  const router = useRouter();

  return (
    <TicketRecordState>
      <Alert className="max-w-sm">
        <AlertTitle>Ticket record unavailable</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
        <Button
          className="mt-2 w-fit"
          onClick={() => router.invalidate()}
          size="sm"
          variant="outline"
        >
          Try again
        </Button>
      </Alert>
    </TicketRecordState>
  );
}

function TicketRecordNotFound() {
  return (
    <TicketRecordState>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Ticket not found</EmptyTitle>
          <EmptyDescription>This maintenance ticket does not exist.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link to="/" />} variant="outline">
            Back to dashboard
          </Button>
        </EmptyContent>
      </Empty>
    </TicketRecordState>
  );
}
