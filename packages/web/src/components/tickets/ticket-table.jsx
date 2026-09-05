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
import { useMemo } from "react";

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

const columns = columnHelper.columns([
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("title", { header: "Title" }),
  columnHelper.accessor("status", {
    header: "Status",
    filterFn: "equalsString",
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    filterFn: "equalsString",
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    filterFn: "equalsString",
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("location", { header: "Location" }),
  columnHelper.accessor("created", {
    header: "Created",
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("updated", {
    header: "Updated",
    enableGlobalFilter: false,
  }),
  columnHelper.accessor(({ assignee }) => assignee ?? "Unassigned", {
    id: "assignee",
    header: "Assignee",
  }),
]);

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
    <>
      <p>
        {rows.length === tickets.length
          ? `${tickets.length} tickets`
          : `${rows.length} of ${tickets.length} tickets`}
      </p>
      <table>
        <caption>Maintenance ticket ledger</caption>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} scope="col">
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No tickets match the current filters.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {row.getAllCells().map((cell) => (
                  <td key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
