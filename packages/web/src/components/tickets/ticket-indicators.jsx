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
