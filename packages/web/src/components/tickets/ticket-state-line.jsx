import { cn } from "cn";
import {
  TicketPriorityIndicator,
  TicketStaleBadge,
  TicketStatusIndicator,
} from "#/components/tickets/ticket-indicators";
import { Separator } from "#/components/ui/separator";

export function TicketStateLine({ ticket, className }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2.5 font-semibold text-[11.5px] uppercase tracking-[0.1em]",
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <TicketStatusIndicator status={ticket.status} />
        {ticket.status}
      </span>
      <Separator className="h-3" orientation="vertical" />
      <span className="flex items-center gap-2">
        <TicketPriorityIndicator muted={ticket.status === "Closed"} priority={ticket.priority} />
        {ticket.priority} priority
      </span>
      {ticket.freshness.stale ? <TicketStaleBadge /> : null}
    </div>
  );
}
