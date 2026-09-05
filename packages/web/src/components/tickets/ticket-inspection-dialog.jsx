import { ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { TicketStateLine } from "#/components/tickets/ticket-state-line";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { formatRelativeDays, formatTicketDate } from "#/lib/ticket-freshness";

function TicketFact({ label, children, mono = false }) {
  return (
    <div className="grid min-w-0 grid-cols-[7.5rem_1fr] items-baseline gap-3 border-border-subtle border-b py-2.5 last:border-b-0 sm:grid-cols-[6.5rem_1fr]">
      <dt className="label-eyebrow text-[10.5px] text-muted-foreground">{label}</dt>
      <dd className={cn("min-w-0 text-[13.5px]", mono && "font-mono text-[12.5px]")}>{children}</dd>
    </div>
  );
}

export function TicketInspectionDialog({ ticket, onOpenChange }) {
  const latestEvent = ticket?.events.at(-1);

  return (
    <Dialog open={ticket !== null} onOpenChange={onOpenChange}>
      {ticket ? (
        <DialogContent
          className="top-4 max-h-[calc(100dvh-2rem)] translate-y-0 gap-0 overflow-y-auto p-0 sm:top-[7vh] sm:max-h-[86dvh] sm:max-w-[760px]"
          showCloseButton={false}
        >
          <DialogHeader className="flex-row items-center justify-between gap-3 bg-bar px-4 py-3 text-bar-foreground">
            <DialogTitle className="font-medium font-mono text-[13px] tracking-[0.04em]">
              Ticket #{ticket.id}
            </DialogTitle>
            <DialogClose
              render={
                <Button
                  aria-label="Close ticket inspection"
                  className="text-bar-muted hover:bg-bar-border hover:text-bar-foreground"
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <XIcon />
            </DialogClose>
            <DialogDescription className="sr-only">
              Quick inspection of maintenance ticket {ticket.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-col gap-3">
              <TicketStateLine ticket={ticket} />
              <h2 className="font-heading font-medium text-[25px] leading-tight">{ticket.title}</h2>
            </div>

            <dl className="grid border-border-subtle border-t sm:grid-cols-2 sm:[&>*:nth-child(even)]:pl-5 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-last-child(-n+2)]:border-b-0">
              <TicketFact label="Raised" mono>
                <time dateTime={ticket.created}>{formatTicketDate(ticket.created)}</time>
              </TicketFact>
              <TicketFact label="Age" mono>
                {ticket.freshness.ageDays} days
              </TicketFact>
              <TicketFact label="Category">{ticket.category}</TicketFact>
              <TicketFact label="Location">{ticket.location}</TicketFact>
              <TicketFact label="Assigned">
                {ticket.assignee ?? <em className="text-muted-foreground">Unassigned</em>}
              </TicketFact>
              <TicketFact label="Activity" mono>
                <time dateTime={ticket.updated}>
                  {formatTicketDate(ticket.updated)} ·{" "}
                  {formatRelativeDays(ticket.freshness.activityDays)}
                </time>
              </TicketFact>
            </dl>

            <section aria-labelledby="latest-note-heading">
              <h3
                className="label-eyebrow mb-2 text-[10.5px] text-muted-foreground"
                id="latest-note-heading"
              >
                Latest note
              </h3>
              <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-3 text-[13.5px] leading-relaxed">
                <time
                  className="text-right font-mono text-[11.5px] text-muted-foreground"
                  dateTime={latestEvent.at}
                >
                  {formatTicketDate(latestEvent.at)}
                </time>
                <p>
                  <span className="font-medium">{latestEvent.actor}:</span> {latestEvent.note}
                </p>
              </div>
            </section>
          </div>

          <DialogFooter className="flex-row items-center justify-between border-border-subtle border-t bg-muted px-5 py-3 sm:justify-between sm:px-7">
            <p className="font-mono text-[11.5px] text-muted-foreground">
              {ticket.events.length} {ticket.events.length === 1 ? "entry" : "entries"} in log
            </p>
            <Button
              nativeButton={false}
              render={<Link params={{ id: String(ticket.id) }} to="/tickets/$id" />}
            >
              Open full record
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
