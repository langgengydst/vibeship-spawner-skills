import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

export const toolLogger = (
  toolName: string,
  args: any,
  result?: any,
  error?: any,
  durationMs?: number,
  sessionId?: string,
) => {
  const logData: any = {
    tool: toolName,
    sessionId: sessionId || "unknown",
    arguments: args,
    duration: durationMs ? `${durationMs}ms` : undefined,
  };

  if (error) {
    logData.error = error;
    logData.status = "FAILED";
    logger.error(
      logData,
      `Tool Call: ${toolName} FAILED [${sessionId || "unknown"}]`,
    );
  } else {
    logData.result = result;
    logData.status = "SUCCESS";
    logger.info(
      logData,
      `Tool Call: ${toolName} SUCCESS [${sessionId || "unknown"}]`,
    );
  }
};

(logger as any).tool = toolLogger;

export interface ExtendedLogger extends pino.Logger {
  tool: typeof toolLogger;
}

export const log = logger as ExtendedLogger;
