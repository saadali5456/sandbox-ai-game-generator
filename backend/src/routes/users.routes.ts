import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
      })
      .returning();

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
});

export default router;

