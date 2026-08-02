const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (message: string, data?: any) => {
    console.log(
      `${colors.blue}[INFO]${colors.reset} ${timestamp()} — ${message}`,
      data ? data : ''
    );
  },

  success: (message: string, data?: any) => {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${timestamp()} — ${message}`,
      data ? data : ''
    );
  },

  warn: (message: string, data?: any) => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${timestamp()} — ${message}`,
      data ? data : ''
    );
  },

  error: (message: string, error?: any) => {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${timestamp()} — ${message}`,
      error ? error : ''
    );
  },

  request: (method: string, path: string, status: number) => {
    const color = status >= 400 ? colors.red : colors.green;
    console.log(
      `${colors.cyan}[REQ]${colors.reset} ${timestamp()} — ${method} ${path} ${color}${status}${colors.reset}`
    );
  },
};

