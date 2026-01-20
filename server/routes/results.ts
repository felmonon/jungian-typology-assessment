import type { Express } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { assessmentResults } from "@shared/models/auth";
import { isAuthenticated } from "../replit_integrations/auth/replitAuth";
import crypto from "crypto";

const FUNCTION_TITLES: Record<string, string> = {
  Te: "Extraverted Thinking",
  Ti: "Introverted Thinking",
  Fe: "Extraverted Feeling",
  Fi: "Introverted Feeling",
  Se: "Extraverted Sensation",
  Si: "Introverted Sensation",
  Ne: "Extraverted Intuition",
  Ni: "Introverted Intuition",
};

function generateShareSlug(): string {
  return crypto.randomBytes(8).toString("base64url");
}

export function registerResultsRoutes(app: Express): void {
  app.post("/api/results", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { scores, stack, attitudeScore, isUndifferentiated } = req.body;

      if (!scores || !stack || attitudeScore === undefined || isUndifferentiated === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const shareSlug = generateShareSlug();

      const [result] = await db
        .insert(assessmentResults)
        .values({
          userId: user.id,
          scores,
          stack,
          attitudeScore: String(attitudeScore),
          isUndifferentiated: String(isUndifferentiated),
          shareSlug,
        })
        .returning();

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error saving result:", error);
      return res.status(500).json({ message: "Failed to save result" });
    }
  });

  app.get("/api/results", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const results = await db
        .select()
        .from(assessmentResults)
        .where(eq(assessmentResults.userId, user.id))
        .orderBy(desc(assessmentResults.createdAt));

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      return res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.get("/api/results/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;

      const [result] = await db
        .select()
        .from(assessmentResults)
        .where(eq(assessmentResults.id, id));

      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

      if (result.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching result:", error);
      return res.status(500).json({ message: "Failed to fetch result" });
    }
  });

  app.get("/api/share/:slug", async (req, res) => {
    try {
      const { slug } = req.params;

      const [result] = await db
        .select()
        .from(assessmentResults)
        .where(eq(assessmentResults.shareSlug, slug));

      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

      const { userId, ...publicResult } = result;
      return res.status(200).json(publicResult);
    } catch (error) {
      console.error("Error fetching shared result:", error);
      return res.status(500).json({ message: "Failed to fetch result" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const results = await db.execute(sql`
        SELECT 
          stack->'dominant'->>'function' as function,
          COUNT(*) as count
        FROM assessment_results
        WHERE stack->'dominant'->>'function' IS NOT NULL
        GROUP BY stack->'dominant'->>'function'
        ORDER BY count DESC
      `);

      const leaderboard = results.rows.map((row: any) => ({
        function: row.function,
        count: parseInt(row.count, 10),
        title: FUNCTION_TITLES[row.function] || row.function,
      }));

      const total = leaderboard.reduce((sum: number, item: any) => sum + item.count, 0);

      return res.status(200).json({ leaderboard, total });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.delete("/api/results/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;

      const [result] = await db
        .select()
        .from(assessmentResults)
        .where(eq(assessmentResults.id, id));

      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

      if (result.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await db.delete(assessmentResults).where(eq(assessmentResults.id, id));

      return res.status(200).json({ message: "Result deleted successfully" });
    } catch (error) {
      console.error("Error deleting result:", error);
      return res.status(500).json({ message: "Failed to delete result" });
    }
  });
}
