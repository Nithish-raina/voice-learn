// singleton logger for the entire application
import pino from "pino";

const transports = [];

// Always log to stdout
transports.push({
  target: "pino/file",
  options: { destination: 1 }, // stdout
});

// Stream to Axiom if configured
if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
  transports.push({
    target: "@axiomhq/pino",
    options: {
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
    },
  });
}

const logger = pino(
  {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  },
  pino.transport({ targets: transports }),
);

export default logger;
