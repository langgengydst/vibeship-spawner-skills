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
    logger.error(`Tool Call: ${toolName} FAILED [${sessionId || "working"}]`);
  }
};

(logger as any).tool = toolLogger;

export interface ExtendedLogger extends pino.Logger {
  tool: typeof toolLogger;
}

export const log = logger as ExtendedLogger;

// Extend Pino.Logger type with our custom tool logger method
export const extendedLogger = logger as pino.Logger & {
  tool: (
    toolName: string,
    args: any,
    result?: any,
    error?: any,
    durationMs?: number,
    sessionId?: string,
  ) => void;
};
