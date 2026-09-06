import { CaretDownIcon, CaretUpDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  globalFilteringFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { cn } from "cn";
import { memo, useMemo } from "react";
import {
  TicketPriorityIndicator,
  TicketStaleBadge,
  TicketStatusIndicator,
} from "#/components/tickets/ticket-indicators";
import { Empty, EmptyHeader, EmptyTitle } from "#/components/ui/empty";
import { ScrollArea } from "#/components/ui/scroll-area";
import { formatRelativeDays, getAgeSeamPercentage } from "#/lib/ticket-freshness";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    equalsString: filterFn_equalsString,
    includesString: filterFn_includesString,
  },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
});
const columnHelper = createColumnHelper();
const priorityRanks = { Low: 0, Medium: 1, High: 2 };
const sortIcons = { asc: CaretUpIcon, desc: CaretDownIcon };

const isClosed = (ticket) => ticket.status === "Closed";

function sortPriority(rowA, rowB, columnId) {
  return priorityRanks[rowA.getValue(columnId)] - priorityRanks[rowB.getValue(columnId)];
}

function SortableHeader({ children, header }) {
  const direction = header.column.getIsSorted();
  const SortIcon = sortIcons[direction] ?? CaretUpDownIcon;

  return (
    <button
      className="group flex h-full w-full items-center gap-1 px-2.5 text-left uppercase transition-colors hover:bg-border-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-inset"
      onClick={header.column.getToggleSortingHandler()}
      type="button"
    >
      <span>{children}</span>
      <SortIcon
        aria-hidden="true"
        className={cn("size-3 shrink-0", !direction && "opacity-35 group-hover:opacity-70")}
        weight="bold"
      />
    </button>
  );
}

function StatusCell({ status }) {
  return (
    <span className="flex items-center gap-[7px]">
      <TicketStatusIndicator status={status} />
      <span
        className={cn(
          "whitespace-nowrap text-[13px]",
          status === "Open" && "font-semibold",
          status === "In Progress" && "font-medium",
          status === "Closed" && "text-muted-foreground",
        )}
      >
        {status}
      </span>
    </span>
  );
}

function PriorityCell({ priority, closed }) {
  return (
    <span className="flex items-center gap-2">
      <TicketPriorityIndicator muted={closed} priority={priority} />
      <span
        className={cn(
          "text-[13px]",
          priority === "High" && !closed && "font-semibold",
          closed && "text-muted-foreground",
        )}
      >
        {priority}
      </span>
    </span>
  );
}

function AgeCell({ ageDays, closed }) {
  const seamPercentage = getAgeSeamPercentage(ageDays);

  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "w-[34px] shrink-0 text-right font-medium font-mono text-[12.5px]",
          closed ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {ageDays}d
      </span>
      <span aria-hidden="true" className="relative flex h-[9px] min-w-0 flex-1 items-end">
        <span className="absolute right-0 bottom-0 left-0 h-px bg-border" />
        <span
          className={cn("relative h-[3px]", closed ? "bg-border" : "bg-foreground")}
          style={{ width: `${seamPercentage}%` }}
        />
      </span>
    </span>
  );
}

function ActivityCell({ activityDays, stale, updated }) {
  return (
    <span className="flex items-center gap-1.5">
      <time
        className={cn(
          "whitespace-nowrap font-mono text-[12.5px]",
          stale ? "text-foreground" : "text-muted-foreground",
        )}
        dateTime={updated}
      >
        {formatRelativeDays(activityDays)}
      </time>
      {stale ? <TicketStaleBadge /> : null}
    </span>
  );
}

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
    sortDescFirst: false,
    cell: ({ getValue }) => (
      <span className="font-mono text-[12px] text-muted-foreground tracking-[-0.01em]">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor(({ freshness }) => freshness.ageDays, {
    id: "age",
    header: "Age",
    enableGlobalFilter: false,
    sortDescFirst: true,
    cell: ({ getValue, row }) => <AgeCell ageDays={getValue()} closed={isClosed(row.original)} />,
  }),
  columnHelper.accessor("title", {
    header: "Description",
    sortDescFirst: false,
    cell: ({ getValue, row }) => (
      <button
        aria-haspopup="dialog"
        className={cn(
          "block max-w-full truncate text-left text-[14px] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          isClosed(row.original) ? "text-muted-foreground" : "font-medium",
        )}
        type="button"
      >
        {getValue()}
      </button>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    filterFn: "equalsString",
    enableGlobalFilter: false,
    sortDescFirst: false,
    cell: ({ getValue }) => <StatusCell status={getValue()} />,
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    filterFn: "equalsString",
    enableGlobalFilter: false,
    sortDescFirst: true,
    sortFn: sortPriority,
    cell: ({ getValue, row }) => (
      <PriorityCell closed={isClosed(row.original)} priority={getValue()} />
    ),
  }),
  columnHelper.accessor("category", {
    header: "Category",
    filterFn: "equalsString",
    enableGlobalFilter: false,
    sortDescFirst: false,
    cell: ({ getValue }) => (
      <span className="text-[13.5px] text-muted-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("location", {
    header: "Location",
    sortDescFirst: false,
    cell: ({ getValue }) => (
      <span className="text-[13.5px] text-muted-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor(({ assignee }) => assignee ?? "Unassigned", {
    id: "assignee",
    header: "Assigned",
    sortDescFirst: false,
    cell: ({ getValue, row }) => (
      <span
        className={cn(
          "text-[13.5px] text-muted-foreground",
          row.original.assignee === null &&
            "text-foreground-faint italic underline decoration-dotted underline-offset-4",
        )}
      >
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor(({ freshness }) => freshness.activityDays, {
    id: "activity",
    header: "Last activity",
    enableGlobalFilter: false,
    sortDescFirst: true,
    cell: ({ getValue, row }) => (
      <ActivityCell
        activityDays={getValue()}
        stale={row.original.freshness.stale}
        updated={row.original.updated}
      />
    ),
  }),
]);

const columnWidths = {
  id: "w-[72px]",
  age: "w-[104px]",
  status: "w-[118px]",
  priority: "w-[96px]",
  category: "w-[104px]",
  location: "w-[130px]",
  assignee: "w-[122px]",
  activity: "w-[136px]",
};

export const TicketTable = memo(function TicketTable({ tickets, filters, onInspect }) {
  const { category, priority, status } = filters;
  const columnFilters = useMemo(
    () => [
      ...(status ? [{ id: "status", value: status }] : []),
      ...(category ? [{ id: "category", value: category }] : []),
      ...(priority ? [{ id: "priority", value: priority }] : []),
    ],
    [status, category, priority],
  );
  const table = useTable({
    features,
    columns,
    data: tickets,
    enableMultiSort: false,
    getRowId: ({ id }) => String(id),
    globalFilterFn: "includesString",
    state: {
      columnFilters,
      globalFilter: filters.q ?? "",
    },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-[18px] pt-[14px] pb-[18px]">
      <div className="mx-auto flex min-h-0 w-full max-w-shell flex-1 flex-col border border-border bg-card">
        <ScrollArea className="min-h-0 flex-1">
          <table className="w-full min-w-[1102px] table-fixed border-collapse">
            <caption className="sr-only">Maintenance ticket ledger</caption>
            <colgroup>
              {table.getAllColumns().map((column) => (
                <col className={columnWidths[column.id]} key={column.id} />
              ))}
            </colgroup>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                      className="sticky top-0 z-1 h-[34px] whitespace-nowrap border-border border-b bg-table-head text-left font-medium font-mono text-[11px] text-muted-foreground uppercase tracking-[0.06em]"
                      key={header.id}
                      scope="col"
                    >
                      {header.isPlaceholder ? null : (
                        <SortableHeader header={header}>
                          <table.FlexRender header={header} />
                        </SortableHeader>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <Empty className="py-10">
                      <EmptyHeader>
                        <EmptyTitle className="font-normal font-sans text-[13px] text-muted-foreground">
                          No tickets match these filters.
                        </EmptyTitle>
                      </EmptyHeader>
                    </Empty>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    className="h-9 cursor-pointer border-border-subtle border-b transition-colors focus-within:bg-muted hover:bg-muted"
                    key={row.id}
                    onClick={() => onInspect(row.original)}
                  >
                    {row.getAllCells().map((cell) => (
                      <td className="truncate px-2.5 align-middle" key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
        <p
          className="flex h-8 shrink-0 items-center border-border-subtle border-t bg-muted px-[11px] font-mono text-[11.5px] text-muted-foreground"
          role="status"
        >
          {rows.length === tickets.length
            ? `${tickets.length} tickets`
            : `${rows.length} of ${tickets.length} tickets`}
        </p>
      </div>
    </div>
  );
});
