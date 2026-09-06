import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  const api = service("api", {
    source: github("rchrd-0/butler-tech", {
      branch: "main",
    }),
    build: {
      buildCommand: "pnpm --filter @butler-tech/server... install --prod --frozen-lockfile",
      watchPatterns: [
        "/packages/server/**",
        "/package.json",
        "/pnpm-lock.yaml",
        "/pnpm-workspace.yaml",
        "/.railway/**",
      ],
    },
    start: "pnpm --filter @butler-tech/server start",
    healthcheck: "/health",
    replicas: {
      "asia-southeast1-eqsg3a": 1,
    },
  });

  return project("butler-tech", {
    resources: [api],
  });
});
