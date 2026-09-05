import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  globalFilteringFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { cn } from "cn";
import { useMemo } from "react";
import { Empty, EmptyHeader, EmptyTitle } from "#/components/ui/empty";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    equalsString: filterFn_equalsString,
    includesString: filterFn_includesString,
  },
});
const columnHelper = createColumnHelper();

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatLedgerDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${String(day).padStart(2, "0")} ${MONTHS[month - 1]} ${year}`;
}

const priorityMarks = {
  High: "bg-priority-high",
  Medium: "bg-priority-medium",
  Low: "bg-priority-low",
};

const isClosed = (ticket) => ticket.status === "Closed";

function StatusCell({ status }) {
  return (
    <span className="flex items-center gap-[7px]">
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
      <span
        aria-hidden="true"
        className={cn("h-3.5 w-[3px] shrink-0", closed ? "bg-border" : priorityMarks[priority])}
      />
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

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
    cell: ({ getValue }) => (
      <span className="font-mono text-[12px] text-muted-foreground tracking-[-0.01em]">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("title", {
    header: "Description",
    cell: ({ getValue, row }) => (
      <span
        className={cn(
          "text-[14px]",
          isClosed(row.original) ? "text-muted-foreground" : "font-medium",
        )}
      >
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    filterFn: "equalsString",
    enableGlobalFilter: false,
    cell: ({ getValue }) => <StatusCell status={getValue()} />,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    filterFn: "equalsString",
    enableGlobalFilter: false,
    cell: ({ getValue }) => (
      <span className="text-[13.5px] text-muted-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    filterFn: "equalsString",
    enableGlobalFilter: false,
    cell: ({ getValue, row }) => (
      <PriorityCell closed={isClosed(row.original)} priority={getValue()} />
    ),
  }),
  columnHelper.accessor("location", {
    header: "Location",
    cell: ({ getValue }) => (
      <span className="text-[13.5px] text-muted-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("created", {
    header: "Created",
    enableGlobalFilter: false,
    cell: ({ getValue }) => (
      <span className="font-mono text-[12.5px] text-muted-foreground">
        {formatLedgerDate(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("updated", {
    header: "Last activity",
    enableGlobalFilter: false,
    cell: ({ getValue }) => (
      <span className="font-mono text-[12.5px] text-muted-foreground">
        {formatLedgerDate(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor(({ assignee }) => assignee ?? "Unassigned", {
    id: "assignee",
    header: "Assigned",
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
]);

const columnWidths = {
  id: "w-[72px]",
  status: "w-[118px]",
  category: "w-[110px]",
  priority: "w-[100px]",
  location: "w-[132px]",
  created: "w-[116px]",
  updated: "w-[116px]",
  assignee: "w-[128px]",
};

export function TicketTable({ tickets, filters }) {
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
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[1112px] table-fixed border-collapse">
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
                      className="sticky top-0 z-1 h-[34px] whitespace-nowrap border-border border-b bg-table-head px-2.5 text-left font-medium font-mono text-[11px] text-muted-foreground uppercase tracking-[0.06em]"
                      key={header.id}
                      scope="col"
                    >
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
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
                    className="h-9 border-border-subtle border-b transition-colors hover:bg-muted"
                    key={row.id}
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
        </div>
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
}
