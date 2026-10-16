import { Router } from "express";
import { db } from "../db/index.js";
import { projects } from "../db/schema.js";
import { and,eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = Router();

router.get("/", authMiddleware ,async (req, res) => {
  try {
    const userId = req.user!.userId;

const allProjects = await db
  .select()
  .from(projects)
  .where(eq(projects.userId, userId));

    res.json({
      success: true,
      projects: allProjects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
});

router.patch("/:id",authMiddleware, async (req, res) => {
  try {
    const projectId = Number(req.params.id);

if (!Number.isInteger(projectId) || projectId <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid project ID",
  });
}
    
    const { name, description } = req.body;
const userId = req.user!.userId;

if (name === undefined && description === undefined) {
  return res.status(400).json({
    success: false,
    message: "Provide a name or description to update",
  });
}

if (
  name !== undefined &&
  (typeof name !== "string" || !name.trim() || name.trim().length > 100)
) {
  return res.status(400).json({
    success: false,
    message: "Project name must be a non-empty string of 100 characters or fewer",
  });
}

if (
  description !== undefined &&
  description !== null &&
  typeof description !== "string"
) {
  return res.status(400).json({
    success: false,
    message: "Description must be a string or null",
  });
}


    const [updatedProject] = await db
      .update(projects)
      .set({
  ...(name !== undefined ? { name: name.trim() } : {}),
  ...(description !== undefined
    ? {
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
      }
    : {}),
})
      
      .where(
  and(
    eq(projects.id, projectId),
    eq(projects.userId, userId)
  )
)
      .returning();

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
  return res.status(400).json({
    success: false,
    message: "Project name is required",
  });
}

if (name.trim().length > 100) {
  return res.status(400).json({
    success: false,
    message: "Project name must be 100 characters or fewer",
  });
}

if (
  description !== undefined &&
  description !== null &&
  typeof description !== "string"
) {
  return res.status(400).json({
    success: false,
    message: "Description must be a string",
  });
}

    const userId = req.user!.userId;

    const [project] = await db
  .insert(projects)
  .values({
    name: name.trim(),
    description: typeof description === "string"
      ? description.trim() || null
      : null,
    userId,
  })
  .returning();

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
});


router.delete("/:id",authMiddleware, async (req, res) => {
  try {
  const projectId = Number(req.params.id);

if (!Number.isInteger(projectId) || projectId <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid project ID",
  });
}

const userId = req.user!.userId;
   const [deletedProject] = await db
  .delete(projects)
  .where(
    and(
      eq(projects.id, projectId),
      eq(projects.userId, userId)
    )
  )
  .returning();

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
      project: deletedProject,
    });
  } catch (error) {
    console.error("Error deleting project:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
});
export default router;