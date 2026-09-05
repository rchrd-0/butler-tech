import { cn } from "cn";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

function FilterField({ id, label, className, children }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label className="label-eyebrow shrink-0 text-[11.5px] text-muted-foreground" htmlFor={id}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function FilterSelect({ id, label, items, value, onValueChange }) {
  return (
    <FilterField id={id} label={label}>
      <Select items={items} value={value ?? null} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          size="sm"
          className="min-w-[7.5rem] bg-card font-semibold uppercase tracking-[0.06em]"
        >
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
    </FilterField>
  );
}

export function TicketFilters({ filters, options, onChange, onClear }) {
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <section
      aria-labelledby="ticket-filters-heading"
      className="shrink-0 border-border border-b bg-card"
    >
      <h2 className="sr-only" id="ticket-filters-heading">
        Filters
      </h2>
      <div className="mx-auto flex w-full max-w-shell flex-wrap items-center gap-x-[22px] gap-y-2.5 px-[18px] py-[11px]">
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
        <div className="ms-auto flex min-w-0 items-center gap-2">
          <FilterField className="min-w-0" id="ticket-search" label="Search">
            <Input
              className="h-7 w-[17rem] min-w-0 max-w-full bg-muted focus-visible:bg-card"
              id="ticket-search"
              onChange={(event) => onChange("q", event.target.value || undefined)}
              placeholder="Title, ID, location, assignee…"
              type="search"
              value={filters.q ?? ""}
            />
          </FilterField>
          <Button
            className="font-semibold text-[11.5px] text-muted-foreground uppercase tracking-label hover:text-foreground disabled:opacity-40"
            disabled={!hasFilters}
            onClick={onClear}
            size="sm"
            type="button"
            variant="ghost"
          >
            Clear
          </Button>
        </div>
      </div>
    </section>
  );
}
