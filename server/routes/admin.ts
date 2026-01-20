import type { Express } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { users, assessmentResults } from "@shared/models/auth";
import { isAuthenticated } from "../replit_integrations/auth/replitAuth";

function isAdmin(req: any, res: any, next: any) {
  const user = req.user as any;
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export function registerAdminRoutes(app: Express): void {
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      const assessmentCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM assessment_results`);

      const userCount = parseInt(userCountResult.rows[0]?.count as string || "0", 10);
      const assessmentCount = parseInt(assessmentCountResult.rows[0]?.count as string || "0", 10);

      return res.status(200).json({
        userCount,
        assessmentCount,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const popularTypesResult = await db.execute(sql`
        SELECT stack->0 as type, COUNT(*) as count
        FROM assessment_results
        WHERE stack IS NOT NULL AND jsonb_array_length(stack) > 0
        GROUP BY stack->0
        ORDER BY count DESC
      `);

      const popularTypes = popularTypesResult.rows.map((row: any) => ({
        type: typeof row.type === 'string' ? row.type.replace(/"/g, '') : String(row.type).replace(/"/g, ''),
        count: parseInt(row.count as string, 10)
      }));

      const dailyAssessmentsResult = await db.execute(sql`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM assessment_results
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);

      const dailyAssessments = dailyAssessmentsResult.rows.map((row: any) => ({
        date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date),
        count: parseInt(row.count as string, 10)
      }));

      const thisWeekResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM assessment_results
        WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
      `);
      const totalThisWeek = parseInt(thisWeekResult.rows[0]?.count as string || "0", 10);

      const lastWeekResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM assessment_results
        WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
          AND created_at < DATE_TRUNC('week', CURRENT_DATE)
      `);
      const totalLastWeek = parseInt(lastWeekResult.rows[0]?.count as string || "0", 10);

      const thisMonthResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM assessment_results
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `);
      const totalThisMonth = parseInt(thisMonthResult.rows[0]?.count as string || "0", 10);

      return res.status(200).json({
        popularTypes,
        dailyAssessments,
        totalThisWeek,
        totalLastWeek,
        totalThisMonth,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
}
