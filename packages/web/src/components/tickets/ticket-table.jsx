import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";

const features = tableFeatures({});
const columnHelper = createColumnHelper();

const columns = columnHelper.columns([
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("title", { header: "Title" }),
  columnHelper.accessor("status", { header: "Status" }),
  columnHelper.accessor("category", { header: "Category" }),
  columnHelper.accessor("priority", { header: "Priority" }),
  columnHelper.accessor("location", { header: "Location" }),
  columnHelper.accessor("created", { header: "Created" }),
  columnHelper.accessor("updated", { header: "Updated" }),
  columnHelper.accessor("assignee", {
    header: "Assignee",
    cell: ({ getValue }) => getValue() ?? "Unassigned",
  }),
]);

export function TicketTable({ tickets }) {
  const table = useTable({
    features,
    columns,
    data: tickets,
    getRowId: ({ id }) => String(id),
  });

  const rows = table.getRowModel().rows;

  return (
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
            <td colSpan={columns.length}>No tickets found.</td>
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
  );
}
