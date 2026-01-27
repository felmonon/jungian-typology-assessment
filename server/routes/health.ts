import type { Express, Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'healthy' | 'unhealthy';
    ai?: 'healthy' | 'unhealthy' | 'unknown';
  };
  metrics?: {
    totalRequests: number;
    averageResponseTime: number;
  };
}

// Simple uptime tracking
const startTime = Date.now();

async function checkDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

async function checkAI(): Promise<boolean> {
  try {
    // Check if AI env vars are set
    const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
    return !!(apiKey && baseUrl);
  } catch {
    return false;
  }
}

export function registerHealthRoutes(app: Express): void {
  // Basic health check
  app.get('/health', async (req: Request, res: Response) => {
    const dbHealthy = await checkDatabase();
    const aiHealthy = await checkAI();
    
    const status: HealthStatus = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        ai: aiHealthy ? 'healthy' : 'unhealthy',
      },
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(status);
  });

  // Detailed health check (for internal monitoring)
  app.get('/health/detailed', async (req: Request, res: Response) => {
    const dbHealthy = await checkDatabase();
    const aiHealthy = await checkAI();
    
    // Get recent request metrics if logger is available
    let metrics;
    try {
      const { getRecentLogs } = await import('../middleware/logger');
      const recentLogs = getRecentLogs(100);
      if (recentLogs.length > 0) {
        const avgDuration = recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length;
        metrics = {
          totalRequests: recentLogs.length,
          averageResponseTime: Math.round(avgDuration),
        };
      }
    } catch {
      // Logger not available
    }

    const status: HealthStatus = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        ai: aiHealthy ? 'healthy' : 'unhealthy',
      },
      metrics,
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(status);
  });

  // Liveness probe (Kubernetes/Docker)
  app.get('/health/live', (req: Request, res: Response) => {
    res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
  });

  // Readiness probe (Kubernetes/Docker)
  app.get('/health/ready', async (req: Request, res: Response) => {
    const dbHealthy = await checkDatabase();
    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json({ 
      status: dbHealthy ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
    });
  });
}
