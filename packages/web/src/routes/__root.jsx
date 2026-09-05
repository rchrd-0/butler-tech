import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AppHeader } from "#/components/app-header";

const RootLayout = () => (
  <div className="flex h-dvh flex-col overflow-hidden bg-background">
    <AppHeader />
    <Outlet />
    {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
  </div>
);

export const Route = createRootRoute({ component: RootLayout });
