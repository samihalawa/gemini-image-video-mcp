import chalk from "chalk";

export type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  private static logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

  private static formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const levelColor = {
      debug: chalk.gray,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
    }[level];

    const formattedMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
    return levelColor(formattedMessage, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    if (this.shouldLog("debug")) {
      console.log(this.formatMessage("debug", message), ...args);
    }
  }

  static info(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("info", message), ...args);
    }
  }

  static warn(message: string, ...args: any[]): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message), ...args);
    }
  }

  static error(message: string, ...args: any[]): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message), ...args);
    }
  }

  static toolInvocation(toolName: string, args: any): void {
    this.info(`🔧 Tool invoked: ${chalk.cyan(toolName)}`, 
      args ? chalk.gray(`with args: ${JSON.stringify(args, null, 2)}`) : "");
  }

  static toolSuccess(toolName: string, result: string): void {
    this.info(`✅ Tool completed: ${chalk.cyan(toolName)}`, 
      chalk.gray(`result: ${result.substring(0, 200)}${result.length > 200 ? "..." : ""}`));
  }

  static apiCall(endpoint: string, params: any): void {
    this.debug(`🌐 API Call: ${chalk.green(endpoint)}`, 
      chalk.gray(`params: ${JSON.stringify(params)}`));
  }

  static apiResponse(endpoint: string, response: any, duration: number): void {
    this.debug(`📡 API Response: ${chalk.green(endpoint)}`, 
      chalk.gray(`status: ${response.status}, duration: ${duration}ms`));
  }

  private static shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  static setLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}