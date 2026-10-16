
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0b12] text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-violet-400">◆</span> Sandbox
        </a>

        <div className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white">
            How it works
          </a>
          <a href="/login" className="hover:text-white">
            Login
          </a>
        </div>

        <a
          href="/register"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
        >
          Get Started
        </a>
      </nav>

      {/* Hero section */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="mb-6 inline-block rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            ✦ Your ideas. Your games. Powered by AI.
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Build games
            <span className="block bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              with AI.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            Turn your ideas into playable games using natural language.
            Describe your vision and let Sandbox help bring it to life.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="/register"
              className="rounded-xl bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500"
            >
              Start Building →
            </a>

            <a
              href="#how-it-works"
              className="rounded-xl border border-zinc-700 px-6 py-4 font-semibold transition hover:bg-zinc-800"
            >
              Explore Sandbox
            </a>
          </div>

          <p className="mt-5 text-sm text-zinc-500">
            From a simple idea to your next game project.
          </p>
        </div>

        {/* Game builder preview */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-violet-950/30">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-semibold">Your next game</p>
              <p className="mt-1 text-sm text-zinc-500">
                AI Game Workspace
              </p>
            </div>
            <span className="rounded-lg bg-violet-500/15 px-3 py-2 text-sm text-violet-300">
              Preview
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="mb-3 text-sm font-medium text-zinc-300">
              Describe your game idea
            </p>

            <div className="min-h-28 rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-sm leading-6 text-zinc-400">
              Create a 2D space adventure where a small robot jumps between
              floating planets and collects glowing crystals...
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Your imagination sets the limits.
              </span>
              <span className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium">
                ✦ Generate
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-zinc-400">
            <div className="rounded-lg bg-white/[0.04] p-3">
              <span className="mb-1 block text-lg">🎮</span>
              Game ideas
            </div>
            <div className="rounded-lg bg-white/[0.04] p-3">
              <span className="mb-1 block text-lg">✦</span>
              AI powered
            </div>
            <div className="rounded-lg bg-white/[0.04] p-3">
              <span className="mb-1 block text-lg">🚀</span>
              Build faster
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 pb-20"
      >
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Why Sandbox?
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            From imagination to creation
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon="✦"
            title="Idea to Game"
            description="Describe the game you imagine and work toward turning it into a playable experience."
          />

          <FeatureCard
            icon="⌘"
            title="A Simple Workflow"
            description="Organize your game projects in one workspace without unnecessary complexity."
          />

          <FeatureCard
            icon="🎮"
            title="Your Projects, Your Way"
            description="Create projects, revisit your ideas, and build on them as your games evolve."
          />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-white/10 px-6 py-16 text-center"
      >
        <h2 className="text-3xl font-bold">Ready to build something?</h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Create your Sandbox account and start organizing your game ideas.
        </p>
        <a
          href="/register"
          className="mt-7 inline-block rounded-xl bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500"
        >
          Get Started →
        </a>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-500/40">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-2xl text-violet-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 leading-7 text-zinc-400">{description}</p>
    </article>
  );
}
