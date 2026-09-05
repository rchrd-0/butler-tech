import { move as moveWidget } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  ArrowCounterClockwiseIcon,
  DotsSixVerticalIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { useMemo, useState } from "react";
import {
  TicketPriorityIndicator,
  TicketStatusIndicator,
} from "#/components/tickets/ticket-indicators";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "#/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  DEFAULT_WIDGET_ORDER,
  loadDashboardLayout,
  saveDashboardLayout,
} from "#/lib/dashboard-layout";
import { formatRelativeDays, STALE_AFTER_DAYS } from "#/lib/ticket-freshness";
import { summarizeTicketOperations } from "#/lib/ticket-operations";

const WIDGET_LABELS = {
  status: "Status counts",
  stale: "Stale — no activity",
  priority: "Priority · active",
  location: "Active by location",
};

function WidgetCard({ children, footer, id, index, onHide, title, widgetId }) {
  const { handleRef, isDragSource, ref } = useSortable({ id: widgetId, index });

  return (
    <div className="min-w-0" ref={ref}>
      <Card
        aria-labelledby={id}
        className={cn(
          "h-[212px] min-w-0 gap-0 border border-border py-0 ring-0",
          isDragSource && "shadow-lg",
        )}
        role="group"
        size="sm"
      >
        <CardHeader className="flex h-8 shrink-0 items-center border-border-subtle border-b bg-table-head p-0 pb-0!">
          <div
            aria-label={`Move ${title} widget`}
            className="flex h-full min-w-0 flex-1 cursor-grab items-center px-2.5 transition-colors hover:bg-border-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-inset active:cursor-grabbing"
            ref={handleRef}
          >
            <span
              aria-hidden="true"
              className="-ml-1 flex size-6 shrink-0 items-center justify-center text-foreground"
            >
              <DotsSixVerticalIcon className="size-4" weight="bold" />
            </span>
            <CardTitle className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-[11.5px] uppercase tracking-[0.11em]" id={id}>
                {title}
              </h3>
            </CardTitle>
          </div>
          <Button
            aria-label={`Hide ${title} widget`}
            className="h-full border-border-subtle border-l text-muted-foreground hover:text-foreground"
            onClick={() => onHide(widgetId)}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <XIcon />
          </Button>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col px-2.5 pt-2.5 pb-1.5">
          {children}
        </CardContent>
        {footer ? (
          <CardFooter className="h-7 shrink-0 border-0 px-2.5 py-0 font-mono text-[11.5px] text-muted-foreground">
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}

function StatusWidget({ index, onHide, statuses, unassignedCount }) {
  return (
    <WidgetCard
      id="status-counts-heading"
      index={index}
      onHide={onHide}
      title={WIDGET_LABELS.status}
      widgetId="status"
      footer={`${unassignedCount} unassigned active`}
    >
      <dl className="flex flex-1 flex-col">
        {statuses.map(({ name, count }, index) => {
          const closed = name === "Closed";

          return (
            <div
              className={cn(
                "flex h-10 shrink-0 items-center gap-2.5",
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

function StaleWidget({ index, onHide, staleCount, staleTickets }) {
  return (
    <WidgetCard
      id="stale-tickets-heading"
      index={index}
      onHide={onHide}
      title={WIDGET_LABELS.stale}
      widgetId="stale"
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
              className="flex h-[26px] shrink-0 items-center gap-2 border-border-subtle border-b last:border-b-0"
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

function PriorityWidget({ index, onHide, priorities }) {
  return (
    <WidgetCard
      id="active-priority-heading"
      index={index}
      onHide={onHide}
      title={WIDGET_LABELS.priority}
      widgetId="priority"
    >
      <div aria-hidden="true" className="mb-2.5 flex h-2.5 shrink-0 bg-border-subtle">
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
      <dl className="flex flex-1 flex-col">
        {priorities.map(({ name, count }, index) => (
          <div
            className={cn(
              "flex h-10 shrink-0 items-center gap-2.5",
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

function LocationWidget({ index, locations, onHide }) {
  const maximumCount = locations[0]?.count ?? 1;

  return (
    <WidgetCard
      id="active-locations-heading"
      index={index}
      onHide={onHide}
      title={WIDGET_LABELS.location}
      widgetId="location"
    >
      {locations.length === 0 ? (
        <p className="flex flex-1 items-center text-[13px] text-muted-foreground">
          No active locations.
        </p>
      ) : (
        <ol className="flex flex-1 flex-col gap-1">
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

function DashboardLayoutMenu({ hiddenWidgetIds, onReset, onVisibilityChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" type="button" variant="outline" />}>
        <SlidersHorizontalIcon data-icon="inline-start" />
        Layout
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="label-eyebrow text-foreground">
            Dashboard layout
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="label-eyebrow">Widgets</DropdownMenuLabel>
          {DEFAULT_WIDGET_ORDER.map((widgetId) => (
            <DropdownMenuCheckboxItem
              checked={!hiddenWidgetIds.includes(widgetId)}
              key={widgetId}
              onCheckedChange={(visible) => onVisibilityChange(widgetId, visible)}
            >
              {WIDGET_LABELS[widgetId]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onReset}>
            <ArrowCounterClockwiseIcon />
            Reset to default
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <p className="px-2 pt-1 pb-2 text-[11.5px] text-muted-foreground leading-relaxed">
          Drag widget titles to reorder. Preferences are saved in this browser.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TicketWidgets({ tickets }) {
  const summary = useMemo(() => summarizeTicketOperations(tickets), [tickets]);
  const [dashboardLayout, setDashboardLayout] = useState(loadDashboardLayout);
  const { hiddenWidgetIds, widgetOrder } = dashboardLayout;
  const visibleWidgetIds = widgetOrder.filter((widgetId) => !hiddenWidgetIds.includes(widgetId));
  const widgetGridColumns = visibleWidgetIds
    .map((widgetId) => `minmax(260px, ${widgetId === "stale" ? 1.12 : 1}fr)`)
    .join(" ");

  const updateDashboardLayout = (nextLayout) => {
    setDashboardLayout(nextLayout);
    saveDashboardLayout(nextLayout);
  };

  const handleDragEnd = (event) => {
    if (event.canceled) return;

    const nextVisibleWidgetIds = moveWidget(visibleWidgetIds, event);
    if (nextVisibleWidgetIds === visibleWidgetIds) return;

    let visibleIndex = 0;
    const nextWidgetOrder = widgetOrder.map((widgetId) =>
      hiddenWidgetIds.includes(widgetId) ? widgetId : nextVisibleWidgetIds[visibleIndex++],
    );

    updateDashboardLayout({ ...dashboardLayout, widgetOrder: nextWidgetOrder });
  };

  const handleVisibilityChange = (widgetId, visible) => {
    const nextHiddenWidgetIds = visible
      ? hiddenWidgetIds.filter((hiddenWidgetId) => hiddenWidgetId !== widgetId)
      : [...hiddenWidgetIds, widgetId];

    updateDashboardLayout({ ...dashboardLayout, hiddenWidgetIds: nextHiddenWidgetIds });
  };

  const handleHideWidget = (widgetId) => handleVisibilityChange(widgetId, false);

  const handleReset = () => {
    updateDashboardLayout({
      widgetOrder: [...DEFAULT_DASHBOARD_LAYOUT.widgetOrder],
      hiddenWidgetIds: [],
    });
  };

  const renderWidget = (widgetId, index) => {
    switch (widgetId) {
      case "status":
        return (
          <StatusWidget
            index={index}
            key={widgetId}
            onHide={handleHideWidget}
            statuses={summary.statuses}
            unassignedCount={summary.unassignedCount}
          />
        );
      case "stale":
        return (
          <StaleWidget
            index={index}
            key={widgetId}
            onHide={handleHideWidget}
            staleCount={summary.staleCount}
            staleTickets={summary.staleTickets}
          />
        );
      case "priority":
        return (
          <PriorityWidget
            index={index}
            key={widgetId}
            onHide={handleHideWidget}
            priorities={summary.priorities}
          />
        );
      case "location":
        return (
          <LocationWidget
            index={index}
            key={widgetId}
            locations={summary.locations}
            onHide={handleHideWidget}
          />
        );
    }
  };

  return (
    <section
      aria-labelledby="operational-overview-heading"
      className="shrink-0 px-[18px] pt-[14px]"
    >
      <div className="mx-auto mb-2 flex h-7 w-full max-w-shell items-center justify-between">
        <h2
          className="label-eyebrow text-[11.5px] text-muted-foreground"
          id="operational-overview-heading"
        >
          Operational overview
        </h2>
        <DashboardLayoutMenu
          hiddenWidgetIds={hiddenWidgetIds}
          onReset={handleReset}
          onVisibilityChange={handleVisibilityChange}
        />
      </div>
      {visibleWidgetIds.length > 0 ? (
        <div className="mx-auto w-full max-w-shell overflow-x-auto">
          <DragDropProvider onDragEnd={handleDragEnd}>
            <div className="grid gap-3" style={{ gridTemplateColumns: widgetGridColumns }}>
              {visibleWidgetIds.map(renderWidget)}
            </div>
          </DragDropProvider>
        </div>
      ) : null}
    </section>
  );
}
