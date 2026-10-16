
import { Router } from "express";
import { and, eq, desc  } from "drizzle-orm";

import { db } from "../db/index.js";
import { projects, generatedGames } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { generateGame } from "../services/gemini.service.js";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { projectId, prompt } = req.body;

    // 1. Validate the project ID.
    const parsedProjectId = Number(projectId);

    if (
      projectId === undefined ||
      projectId === null ||
      projectId === "" ||
      !Number.isSafeInteger(parsedProjectId) ||
      parsedProjectId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid project ID is required",
      });
    }

    // 2. Validate the game description.
    if (
      typeof prompt !== "string" ||
      !prompt.trim() ||
      prompt.length > 4000
    ) {
      return res.status(400).json({
        success: false,
        message: "Game description must contain 1–4000 characters",
      });
    }

    const userId = req.user!.userId;

    // 3. Confirm this project belongs to the logged-in user.
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.id, parsedProjectId),
          eq(projects.userId, userId)
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // 4. Generate and validate the game with Gemini.
    let game;

    try {
      game = await generateGame(prompt.trim());
    } catch (error) {
      console.error(
        "Game generation failed:",
        error instanceof Error ? error.message : "Unknown error"
      );

      return res.status(502).json({
        success: false,
        message: "Game generation failed. Please try again.",
      });
    }

    // 5. Save the validated game in PostgreSQL.
    const [savedGame] = await db
      .insert(generatedGames)
      .values({
        projectId: project.id,
        gameName: game.gameName,
        prompt: prompt.trim(),
        files: game.files,
        status: "ready",
        version: 1,
      })
      .returning();

    // 6. Return the saved game.
    return res.status(201).json({
      success: true,
      message: "Game generated and saved successfully",
      game: savedGame,
    });
  } catch (error) {
    console.error("Game route failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate and save the game",
    });
  }
});

router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (
      !Number.isSafeInteger(projectId) ||
      projectId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid project ID is required",
      });
    }

    const userId = req.user!.userId;

    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.userId, userId)
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const games = await db
      .select()
      .from(generatedGames)
      .where(eq(generatedGames.projectId, projectId))
      .orderBy(desc(generatedGames.createdAt));

    return res.status(200).json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Fetch games failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch games",
    });
  }
});

export default router;
