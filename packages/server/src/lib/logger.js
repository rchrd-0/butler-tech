import { initLogger } from "evlog";

initLogger({
  env: { service: "butler-server" },
});

export { log } from "evlog";
export { evlog, useLogger } from "evlog/express";
