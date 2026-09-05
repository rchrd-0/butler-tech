import { cn } from "cn";

const priorityMarks = {
  High: "bg-priority-high",
  Medium: "bg-priority-medium",
  Low: "bg-priority-low",
};

export function TicketStatusIndicator({ status }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-2 shrink-0",
        status === "Open" && "bg-foreground",
        status === "In Progress" &&
          "border border-foreground bg-[linear-gradient(90deg,var(--foreground)_50%,transparent_50%)]",
        status === "Closed" && "border border-foreground-faint",
      )}
    />
  );
}

export function TicketPriorityIndicator({ priority, muted = false }) {
  return (
    <span
      aria-hidden="true"
      className={cn("h-3.5 w-[3px] shrink-0", muted ? "bg-border" : priorityMarks[priority])}
    />
  );
}

export function TicketStaleBadge() {
  return (
    <span className="shrink-0 border border-foreground px-1 py-px font-bold font-sans text-[9.5px] uppercase leading-[1.2] tracking-[0.1em]">
      Stale
    </span>
  );
}
