import server from "#/app.js";
import { log } from "#/lib/logger.js";

const port = process.env.PORT || 3000;

const listener = server.listen(port, () => {
  log.info({
    event: "server_started",
    port,
  });
});

listener.on("error", (error) => {
  log.error({
    event: "server_start_failed",
    error: error.message,
    port,
  });

  process.exitCode = 1;
});
