
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef} from "react";



function buildPreviewDocument(
  files: { path: string; content: string }[]
) {
  const htmlFile = files.find((file) => file.path === "index.html");
  const cssFile = files.find((file) => file.path === "style.css");
  const jsFile = files.find((file) => file.path === "game.js");

  if (!htmlFile) {
    return "<h2>Game HTML file not found.</h2>";
  }

  const css = (cssFile?.content ?? "").replace(
    /<\/style/gi,
    "<\\/style"
  );

  let js = jsFile?.content ?? "";

  // Provide a limited storage substitute inside the preview.
  js = js.replace(
    /\blocalStorage\b/g,
    "({ getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} })"
  );

  // Prevent embedded script tags from terminating the outer script.
  js = js.replace(/<\/script/gi, "<\\/script");

  let html = htmlFile.content;

  html = html.replace(
    /<link\b[^>]*href=["']style\.css["'][^>]*>/i,
    () => `<style>${css}</style>`
  );

  html = html.replace(
    /<script\b[^>]*src=["']game\.js["'][^>]*>\s*<\/script>/i,
    () => `<script>${js}</script>`
  );

  return html;
}





export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id ?? "Unknown";
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const gamePreviewRef = useRef<HTMLIFrameElement>(null);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
  async function fetchGames() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/games/${projectId}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch games");
      }

      setGames(data.games);
      setGames(data.games);

if (data.games.length > 0) {
  setSelectedGame(data.games[0]);
}

    } catch (error) {
      console.error("Failed to fetch saved games:", error);
    } finally {
      setLoadingGames(false);
    }
  }

  fetchGames();
}, [projectId]);


  return (
    <main className="min-h-screen bg-[#0b0b12] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <a
          href="/dashboard"
          className="text-sm text-violet-400 hover:text-violet-300"
        >
          ← Back to Projects
        </a>

        <h1 className="mt-6 text-4xl font-bold">Project Workspace</h1>

        <p className="mt-3 text-zinc-400">
          Project ID: {projectId}
        </p>

        
<section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <h2 className="text-xl font-semibold">AI Game Generator</h2>

  <p className="mt-2 text-zinc-400">
    Describe the game you want to create.
  </p>

  <form
    className="mt-6 space-y-4"
    
onSubmit={async (event) => {
  event.preventDefault();

  setGenerating(true);
  setMessage("");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/games`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          projectId: Number(projectId),
          prompt: prompt.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Game generation failed.");
    }

    setGames((previousGames) => [
  data.game,
  ...previousGames,
]);

setSelectedGame(data.game);
setPreviewKey((previous) => previous + 1);
setMessage(`Successfully generated: ${data.game.gameName}`);
setPrompt("");

  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );
  } finally {
    setGenerating(false);
  }
}}

  >
    <label htmlFor="gamePrompt" className="block text-sm font-medium">
      Game prompt
    </label>

    <textarea
      id="gamePrompt"
      name="prompt"
      value={prompt}
      onChange={(event) => setPrompt(event.target.value)}
      rows={5}
      required
      maxLength={4000}
      placeholder="Example: Create a 2D coin collecting game with arrow-key movement, coins, obstacles, and a restart button."
      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-violet-500"
    />

    
<button
  type="submit"
  disabled={generating}
  className="rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  {generating ? "Generating Game..." : "Generate Game"}
</button>

  </form>

  
<div className="mt-8">
  
<div className="mb-8">
  <h2 className="mb-4 text-xl font-bold text-white">
    Game Preview
  </h2>

  {selectedGame ? (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-white">
      
<div className="flex items-center justify-between bg-zinc-900 px-4 py-3">
  <span className="font-medium text-white">
    {selectedGame.gameName}
  </span>

  <div className="flex items-center gap-3">
    <span className="text-xs text-zinc-400">
      Live Preview
    </span>

    <button
      type="button"
      onClick={() => setPreviewKey((previous) => previous + 1)}
      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
    >
      Restart Game
    </button>
  </div>
</div>


      <iframe
        key={`${selectedGame.id}-${previewKey}`}
        title={`${selectedGame.gameName} preview`}
        srcDoc={buildPreviewDocument(selectedGame.files)}
        ref={gamePreviewRef}
        sandbox="allow-scripts"
        className="h-[500px] w-full border-0"
      />
    </div>
  ) : (
    <p className="text-zinc-400">
      {loadingGames
        ? "Preparing your game preview..."
        : "Generate a game to see its preview here."}
    </p>
  )}
</div>

  <h2 className="text-xl font-bold text-white">
    Your Generated Games
  </h2>

  {loadingGames ? (
    <p className="mt-3 text-zinc-400">Loading saved games...</p>
  ) : games.length === 0 ? (
    <p className="mt-3 text-zinc-400">
      No games generated yet.
    </p>
  ) : (
    <div className="mt-4 space-y-3">
      {games.map((game) => (
        <div
          key={game.id}
          className="rounded-lg border border-zinc-700 p-4"
        >
          <h3 className="font-semibold text-white">
            {game.gameName}
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            {game.prompt}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Version {game.version} · Game ID {game.id}
          </p>
          
<button
  type="button"
  onClick={() => setSelectedGame(game)}
  className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
>
  {selectedGame?.id === game.id
    ? "Currently Previewing"
    : "Preview This Game"}
</button>

        </div>
      ))}
    </div>
  )}
</div>

  
{message && (
  <p className="mt-4 text-sm text-zinc-300" role="status">
    {message}
  </p>
)}

</section>

      </div>
    </main>
  );
}
