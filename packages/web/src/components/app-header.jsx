import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link, useMatch } from "@tanstack/react-router";
import { Separator } from "#/components/ui/separator";

export function AppHeader() {
  const ticketId = useMatch({
    from: "/tickets/$id",
    shouldThrow: false,
    select: (match) => match.params.id,
  });

  return (
    <header className="flex h-[50px] shrink-0 items-center bg-bar px-[18px] text-bar-foreground">
      <div className="mx-auto flex w-full max-w-shell items-center gap-2.5">
        {ticketId ? (
          <>
            <Link
              className="label-eyebrow flex h-7 items-center gap-1.5 border border-bar-border px-2.5 text-[11px] hover:bg-bar-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bar-muted"
              to="/"
            >
              <ArrowLeftIcon aria-hidden="true" />
              Dashboard
            </Link>
            <Separator
              className="h-[13px] bg-bar-border data-vertical:self-center"
              orientation="vertical"
            />
            <span className="font-mono text-[11.5px] text-bar-muted">Ticket #{ticketId}</span>
            <span className="label-eyebrow ms-auto text-[11px] text-bar-muted">Ticket record</span>
          </>
        ) : (
          <>
            <span className="label-eyebrow text-[13px]">Butler Asia</span>
            <Separator
              className="h-[13px] bg-bar-border data-vertical:self-center"
              orientation="vertical"
            />
            <span className="label-eyebrow font-medium text-[12px] text-bar-muted">
              Maintenance operations
            </span>
          </>
        )}
      </div>
    </header>
  );
}
