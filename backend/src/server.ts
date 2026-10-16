import express from "express";
import cors from "cors";
import { db } from "./db/index.js";
import projectsRouter from "./routes/projects.routes.js";
import usersRouter from "./routes/users.routes";
import authRouter from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import gamesRouter from "./routes/games.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/games", gamesRouter);


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Sandbox backend is running",
  });
});

const PORT = 5000;
db.execute("SELECT 1")
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

app.listen(PORT, () => {
  console.log(`Sandbox backend running on http://localhost:${PORT}`);
});