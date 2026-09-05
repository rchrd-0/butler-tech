import { cn } from "cn";
import { useMemo } from "react";
import {
  TicketPriorityIndicator,
  TicketStatusIndicator,
} from "#/components/tickets/ticket-indicators";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "#/components/ui/card";
import { formatRelativeDays, STALE_AFTER_DAYS } from "#/lib/ticket-freshness";
import { summarizeTicketOperations } from "#/lib/ticket-operations";

function WidgetCard({ id, title, footer, children }) {
  return (
    <Card
      aria-labelledby={id}
      className="h-[212px] min-w-0 gap-0 border border-border py-0 ring-0"
      role="group"
      size="sm"
    >
      <CardHeader className="flex h-8 shrink-0 items-center border-border-subtle border-b bg-muted px-2.5 py-0 pb-0!">
        <CardTitle>
          <h3 className="font-bold text-[11.5px] uppercase tracking-[0.11em]" id={id}>
            {title}
          </h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-2.5 py-1.5">{children}</CardContent>
      {footer ? (
        <CardFooter className="h-7 shrink-0 border-0 px-2.5 py-0 font-mono text-[11.5px] text-muted-foreground">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}

function StatusWidget({ statuses, unassignedCount }) {
  return (
    <WidgetCard
      id="status-counts-heading"
      title="Status counts"
      footer={`${unassignedCount} unassigned active`}
    >
      <dl className="flex flex-1 flex-col justify-center">
        {statuses.map(({ name, count }, index) => {
          const closed = name === "Closed";

          return (
            <div
              className={cn(
                "flex flex-1 items-center gap-2.5 py-1",
                index < statuses.length - 1 && "border-border-subtle border-b",
              )}
              key={name}
            >
              <dt
                className={cn(
                  "flex flex-1 items-center gap-2.5 text-[13.5px]",
                  closed ? "text-muted-foreground" : "font-medium",
                )}
              >
                <TicketStatusIndicator status={name} />
                <span>{name}</span>
              </dt>
              <dd
                className={cn(
                  "font-mono text-[20px] tracking-[-0.02em]",
                  closed && "text-muted-foreground",
                )}
              >
                {count}
              </dd>
            </div>
          );
        })}
      </dl>
    </WidgetCard>
  );
}

function StaleWidget({ staleCount, staleTickets }) {
  return (
    <WidgetCard
      id="stale-tickets-heading"
      title="Stale — no activity"
      footer={`${staleCount} active · no update in ${STALE_AFTER_DAYS}+ days`}
    >
      {staleTickets.length === 0 ? (
        <p className="flex flex-1 items-center text-[13px] text-muted-foreground">
          No stale tickets.
        </p>
      ) : (
        <ol className="flex min-h-0 flex-1 flex-col">
          {staleTickets.map((ticket) => (
            <li
              className="flex min-h-0 flex-1 items-center gap-2 border-border-subtle border-b last:border-b-0"
              key={ticket.id}
            >
              <span className="shrink-0 font-mono text-[11.5px] text-muted-foreground">
                #{ticket.id}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px]">{ticket.title}</span>
              <time
                className="shrink-0 font-medium font-mono text-[12px]"
                dateTime={ticket.updated}
              >
                {formatRelativeDays(ticket.freshness.activityDays)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </WidgetCard>
  );
}

function PriorityWidget({ priorities }) {
  return (
    <WidgetCard id="active-priority-heading" title="Priority · active">
      <div aria-hidden="true" className="mt-3 mb-2.5 flex h-2.5 shrink-0 bg-border-subtle">
        {priorities.map(({ name, count }) => (
          <span
            className={cn(
              "basis-0",
              name === "High" && "bg-priority-high",
              name === "Medium" && "bg-priority-medium",
              name === "Low" && "bg-priority-low",
            )}
            key={name}
            style={{ flexGrow: count }}
          />
        ))}
      </div>
      <dl className="flex flex-1 flex-col justify-center">
        {priorities.map(({ name, count }, index) => (
          <div
            className={cn(
              "flex flex-1 items-center gap-2.5 py-0.5",
              index < priorities.length - 1 && "border-border-subtle border-b",
            )}
            key={name}
          >
            <dt
              className={cn(
                "flex flex-1 items-center gap-2.5 text-[13.5px]",
                name === "High" && "font-semibold",
              )}
            >
              <TicketPriorityIndicator priority={name} />
              <span>{name}</span>
            </dt>
            <dd className="font-mono text-[16px]">{count}</dd>
          </div>
        ))}
      </dl>
    </WidgetCard>
  );
}

function LocationWidget({ locations }) {
  const maximumCount = locations[0]?.count ?? 1;

  return (
    <WidgetCard id="active-locations-heading" title="Active by location">
      {locations.length === 0 ? (
        <p className="flex flex-1 items-center text-[13px] text-muted-foreground">
          No active locations.
        </p>
      ) : (
        <ol className="flex flex-1 flex-col justify-center gap-1">
          {locations.map(({ name, count }) => (
            <li className="flex items-center gap-2" key={name}>
              <span className="w-[96px] shrink-0 truncate text-[13px]">{name}</span>
              <span aria-hidden="true" className="flex h-[7px] min-w-0 flex-1 bg-border-subtle">
                <span
                  className="bg-foreground"
                  style={{ width: `${Math.round((count / maximumCount) * 100)}%` }}
                />
              </span>
              <span className="shrink-0 font-mono text-[12px]">{count}</span>
            </li>
          ))}
        </ol>
      )}
    </WidgetCard>
  );
}

export function TicketWidgets({ tickets }) {
  const summary = useMemo(() => summarizeTicketOperations(tickets), [tickets]);

  return (
    <section
      aria-labelledby="operational-overview-heading"
      className="shrink-0 px-[18px] pt-[14px]"
    >
      <h2 className="sr-only" id="operational-overview-heading">
        Operational overview
      </h2>
      <div className="mx-auto w-full max-w-shell overflow-x-auto">
        <div className="grid min-w-[1102px] grid-cols-[1fr_1.12fr_1fr_1fr] gap-3">
          <StatusWidget statuses={summary.statuses} unassignedCount={summary.unassignedCount} />
          <StaleWidget staleCount={summary.staleCount} staleTickets={summary.staleTickets} />
          <PriorityWidget priorities={summary.priorities} />
          <LocationWidget locations={summary.locations} />
        </div>
      </div>
    </section>
  );
}
