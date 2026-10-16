import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from backend/.env");
}

const ai = new GoogleGenAI({ apiKey });

const REQUIRED_FILES = [
  "index.html",
  "game.js",
  "style.css",
] as const;

const MAX_PROMPT_LENGTH = 4_000;
const MAX_FILE_SIZE = 500_000;
const MAX_TOTAL_SIZE = 1_000_000;

type GameFile = {
  path: string;
  content: string;
};

type GeneratedGame = {
  gameName: string;
  files: GameFile[];
};

function validateGame(game: unknown): GeneratedGame {
  if (
    typeof game !== "object" ||
    game === null ||
    !("gameName" in game) ||
    !("files" in game)
  ) {
    throw new Error("Gemini returned an invalid game structure");
  }

  if (
    typeof game.gameName !== "string" ||
    game.gameName.trim().length === 0 ||
    game.gameName.length > 150
  ) {
    throw new Error("Game name must contain 1–150 characters");
  }

  if (!Array.isArray(game.files) || game.files.length !== 3) {
    throw new Error("Game must contain exactly three required files");
  }

  const files: GameFile[] = [];
  const seenPaths = new Set<string>();
  let totalSize = 0;

  for (const file of game.files) {
    if (
      typeof file !== "object" ||
      file === null ||
      !("path" in file) ||
      !("content" in file)
    ) {
      throw new Error("A generated file has an invalid structure");
    }

    if (
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error("File paths and contents must be strings");
    }

    if (
      !REQUIRED_FILES.includes(
        file.path as (typeof REQUIRED_FILES)[number]
      )
    ) {
      throw new Error(`Unexpected game file: ${file.path}`);
    }

    if (seenPaths.has(file.path)) {
      throw new Error(`Duplicate game file: ${file.path}`);
    }

    if (file.content.trim().length === 0) {
      throw new Error(`Generated file is empty: ${file.path}`);
    }

    const fileSize = Buffer.byteLength(file.content, "utf8");

    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`Generated file is too large: ${file.path}`);
    }

    totalSize += fileSize;

    if (totalSize > MAX_TOTAL_SIZE) {
      throw new Error("Combined game files exceed the size limit");
    }

    seenPaths.add(file.path);
    files.push({
      path: file.path,
      content: file.content,
    });
  }

  for (const requiredPath of REQUIRED_FILES) {
    if (!seenPaths.has(requiredPath)) {
      throw new Error(`Missing required game file: ${requiredPath}`);
    }
  }

  return {
    gameName: game.gameName.trim(),
    files,
  };
}

export async function generateGame(
  prompt: string
): Promise<GeneratedGame> {
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("Game description cannot be empty");
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(
      `Game description cannot exceed ${MAX_PROMPT_LENGTH} characters`
    );
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: `
You are the game-generation engine for Sandbox.

Create a simple, playable browser game based on the user's request.

Return ONLY valid JSON with this exact structure:
{
  "gameName": "Name of the game",
  "files": [
    { "path": "index.html", "content": "complete HTML" },
    { "path": "game.js", "content": "complete JavaScript" },
    { "path": "style.css", "content": "complete CSS" }
  ]
}


Requirements:
- Generate a complete, functional browser game, not a mockup.
- The player must be able to interact with the game using controls appropriate to the requested game.
- For games involving player movement, support WASD and arrow keys unless the game concept requires different controls.
- Register keyboard listeners on window or document so controls work when the game preview has focus.
- Prevent default browser behavior for handled movement keys when appropriate.
- Make controls work after restarting the game; do not register duplicate event listeners on every restart.
- Initialize the game only after the required DOM elements exist.
- Ensure every DOM element accessed by JavaScript exists in index.html.
- Implement the complete gameplay loop, including input handling, state updates, rendering, collisions, scoring, and game-over behavior as appropriate.
- Include a visible, functional restart control and reset all relevant game state when it is activated.
- Ensure keyboard controls work after the player clicks inside the game preview.
- Display short instructions in the game UI explaining how to play.
- Avoid undefined variables, missing functions, syntax errors, and references to nonexistent DOM elements.
- Do not rely on external libraries, remote scripts, images, or assets; implement the game using native browser APIs.
- Handle browser API restrictions gracefully, including unavailable or blocked localStorage and audio.
- Keep the game self-contained and compatible with a sandboxed iframe using sandbox="allow-scripts".
- Use canvas or DOM rendering as appropriate, and ensure the player and gameplay objects are visible on screen.
- Include exactly these three files: index.html, game.js, style.css.
- Return complete file contents, not partial snippets.
- Do not include Markdown code fences.
- Return ONLY valid JSON matching the required structure.


User's game description:
${prompt.trim()}
`,
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  let game: unknown;

  try {
    game = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  return validateGame(game);
}
