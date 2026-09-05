import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

function FilterSelect({ id, label, items, value, onValueChange }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <Select items={items} value={value ?? null} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.label} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function TicketFilters({ filters, options, onChange, onClear }) {
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <section aria-labelledby="ticket-filters-heading">
      <h2 id="ticket-filters-heading">Filters</h2>
      <div>
        <label htmlFor="ticket-search">Search</label>
        <Input
          id="ticket-search"
          type="search"
          placeholder="Search tickets"
          value={filters.q ?? ""}
          onChange={(event) => onChange("q", event.target.value || undefined)}
        />
      </div>
      <FilterSelect
        id="status-filter"
        label="Status"
        items={options.status}
        value={filters.status}
        onValueChange={(value) => onChange("status", value ?? undefined)}
      />
      <FilterSelect
        id="category-filter"
        label="Category"
        items={options.category}
        value={filters.category}
        onValueChange={(value) => onChange("category", value ?? undefined)}
      />
      <FilterSelect
        id="priority-filter"
        label="Priority"
        items={options.priority}
        value={filters.priority}
        onValueChange={(value) => onChange("priority", value ?? undefined)}
      />
      {hasFilters ? (
        <Button type="button" variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </section>
  );
}
