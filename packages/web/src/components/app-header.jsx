import { Separator } from "#/components/ui/separator";

export function AppHeader() {
  return (
    <header className="flex h-[50px] shrink-0 items-center bg-bar text-bar-foreground">
      <div className="mx-auto flex w-full max-w-shell items-center gap-2.5 px-[18px]">
        <span className="label-eyebrow text-[13px]">Butler Asia</span>
        <Separator className="h-[13px] bg-bar-border" orientation="vertical" />
        <span className="label-eyebrow font-medium text-[12px] text-bar-muted">
          Maintenance operations
        </span>
      </div>
    </header>
  );
}
