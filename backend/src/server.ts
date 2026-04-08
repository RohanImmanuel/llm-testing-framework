import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { logger } from "./lib/logger.js";

const env = loadEnv();
const app = createApp({ env });

app.listen(env.port, () => {
  logger.info("Backend server listening.", {
    port: env.port,
    model: env.geminiModel,
  });
});
