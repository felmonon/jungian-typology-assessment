import type { Request, Response, NextFunction } from 'express';

interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, any>;
  userId?: string;
  userEmail?: string;
  ip: string;
  userAgent: string;
  statusCode?: number;
  duration: number;
  error?: string;
}

// Simple in-memory buffer for recent logs (last 1000 requests)
const logBuffer: RequestLog[] = [];
const MAX_BUFFER_SIZE = 1000;

export function getRecentLogs(count: number = 100): RequestLog[] {
  return logBuffer.slice(-count).reverse();
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const user = req.user as any;
  
  const logEntry: Partial<RequestLog> = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query as Record<string, any>,
    userId: user?.id,
    userEmail: user?.email,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
  };

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const completeLog: RequestLog = {
      ...logEntry,
      statusCode: res.statusCode,
      duration,
    } as RequestLog;

    // Add to buffer
    logBuffer.push(completeLog);
    if (logBuffer.length > MAX_BUFFER_SIZE) {
      logBuffer.shift();
    }

    // Log to console with color coding
    const statusColor = res.statusCode >= 500 
      ? '\x1b[31m' // Red for server errors
      : res.statusCode >= 400 
        ? '\x1b[33m' // Yellow for client errors
        : res.statusCode >= 300 
          ? '\x1b[36m' // Cyan for redirects
          : '\x1b[32m'; // Green for success
    
    const resetColor = '\x1b[0m';
    const userStr = user?.id ? ` user:${user.id.slice(0, 8)}` : '';
    
    console.log(
      `[${completeLog.timestamp}] ${req.method} ${req.path} ` +
      `${statusColor}${res.statusCode}${resetColor} ` +
      `${duration}ms${userStr}`
    );

    // Log warnings for slow requests (>5s) or errors
    if (duration > 5000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    if (res.statusCode >= 500) {
      console.error(`🔥 Server error: ${req.method} ${req.path} returned ${res.statusCode}`);
    }
  });

  next();
}

// Error logger middleware
export function errorLogger(
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const user = req.user as any;
  
  console.error('🔥 Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: user?.id,
    timestamp: new Date().toISOString(),
  });

  // Add error to recent log entry if exists
  const lastLog = logBuffer[logBuffer.length - 1];
  if (lastLog && lastLog.path === req.path && lastLog.method === req.method) {
    lastLog.error = err.message;
  }

  next(err);
}
