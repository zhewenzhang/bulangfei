// 环境变量控制的日志工具
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isDebugEnabled = process.env.REACT_APP_DEBUG === 'true';
  }

  log(...args) {
    if (this.isDevelopment || this.isDebugEnabled) {
      console.log(...args);
    }
  }

  error(...args) {
    // 错误日志在所有环境下都应该输出
    console.error(...args);
  }

  warn(...args) {
    if (this.isDevelopment || this.isDebugEnabled) {
      console.warn(...args);
    }
  }

  info(...args) {
    if (this.isDevelopment || this.isDebugEnabled) {
      console.info(...args);
    }
  }

  debug(...args) {
    if (this.isDebugEnabled) {
      console.debug(...args);
    }
  }
}

// 导出单例实例
export const logger = new Logger();
export default logger;