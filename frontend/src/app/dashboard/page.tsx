
"use client";

import { useEffect, useState } from "react";

type Project = {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  createdAt: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
const [editName, setEditName] = useState("");
const [editDescription, setEditDescription] = useState("");
const [savingEdit, setSavingEdit] = useState(false);
const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch projects");
        }

        setProjects(data.projects);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);
  
async function handleCreateProject(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();
  setCreating(true);
  setError("");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create project");
    }

    setProjects((currentProjects) => [
      data.project,
      ...currentProjects,
    ]);

    setProjectName("");
    setProjectDescription("");
    setShowForm(false);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to create project"
    );
  } finally {
    setCreating(false);
  }
}

function startEditing(project: Project) {
  setEditingProjectId(project.id);
  setEditName(project.name);
  setEditDescription(project.description ?? "");
  setError("");
}

async function handleSaveEdit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (editingProjectId === null) return;

  setSavingEdit(true);
  setError("");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${editingProjectId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update project");
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === editingProjectId ? data.project : project
      )
    );

    setEditingProjectId(null);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to update project"
    );
  } finally {
    setSavingEdit(false);
  }
}

async function handleDeleteProject(projectId: number) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this project?"
  );

  if (!confirmed) return;

  setDeletingProjectId(projectId);
  setError("");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete project");
    }

    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId)
    );
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to delete project"
    );
  } finally {
    setDeletingProjectId(null);
  }
}


  return (
    <main className="min-h-screen bg-[#0b0b12] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <a href="/" className="text-2xl font-bold">
            <span className="text-violet-400">◆</span> Sandbox
          </a>

          
<button
  onClick={async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } finally {
      window.location.href = "/login";
    }
  }}
  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10"
>
  Log Out
</button>

        </header>

        <section className="py-12">
          <p className="text-sm font-medium text-violet-400">
            YOUR WORKSPACE
          </p>

          <h1 className="mt-3 text-4xl font-bold">My Projects</h1>
          
<div className="mt-8">
  <button
    onClick={() => setShowForm((visible) => !visible)}
    className="rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
  >
    {showForm ? "Cancel" : "+ Create Project"}
  </button>

  {showForm && (
    <form
      onSubmit={handleCreateProject}
      className="mt-5 max-w-xl space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
    >
      <div>
        <label htmlFor="projectName" className="mb-2 block text-sm">
          Project name
        </label>
        <input
          id="projectName"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          maxLength={100}
          required
          placeholder="My first 3D game"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label htmlFor="projectDescription" className="mb-2 block text-sm">
          Description (optional)
        </label>
        <textarea
          id="projectDescription"
          value={projectDescription}
          onChange={(event) => setProjectDescription(event.target.value)}
          rows={3}
          placeholder="Describe the game you want to build"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-violet-500"
        />
      </div>

      <button
        type="submit"
        disabled={creating}
        className="rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500 disabled:opacity-50"
      >
        {creating ? "Creating..." : "Save Project"}
      </button>
    </form>
  )}
</div>


          <p className="mt-3 text-zinc-400">
            Your game projects will appear here.
          </p>

          {loading ? (
            <p className="mt-10 text-zinc-400">Loading projects...</p>
          ) : error ? (
            <div className="mt-10 rounded-xl border border-red-500/30 p-6">
              <p className="text-red-400">{error}</p>
              <p className="mt-2 text-sm text-zinc-400">
                Check that you are logged in and the backend is running.
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-white/20 p-12 text-center">
              <h2 className="text-xl font-semibold">No projects yet</h2>
              <p className="mt-2 text-sm text-zinc-400">
                We will add project creation next.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              
{projects.map((project) => (
  <article
    key={project.id}
    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
  >
    {editingProjectId === project.id ? (
      <form onSubmit={handleSaveEdit} className="space-y-4">
        <div>
          <label
            htmlFor={`edit-name-${project.id}`}
            className="mb-2 block text-sm"
          >
            Project name
          </label>
          <input
            id={`edit-name-${project.id}`}
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            maxLength={100}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label
            htmlFor={`edit-description-${project.id}`}
            className="mb-2 block text-sm"
          >
            Description
          </label>
          <textarea
            id={`edit-description-${project.id}`}
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={savingEdit}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {savingEdit ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => setEditingProjectId(null)}
            disabled={savingEdit}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    ) : (
      <>
        <h2 className="text-lg font-semibold">{project.name}</h2>

        <p className="mt-2 text-sm text-zinc-400">
          {project.description || "No description provided."}
        </p>

        <p className="mt-5 text-xs text-zinc-500">
          Project ID: {project.id}
        </p>

        <div className="mt-5 flex gap-3">
  <button
    type="button"
    onClick={() => {
      window.location.href = `/projects/${project.id}`;
    }}
    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
  >
    Open Project
  </button>

  <button
    type="button"
    onClick={() => startEditing(project)}
    disabled={deletingProjectId === project.id}
    className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
  >
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDeleteProject(project.id)}
            disabled={deletingProjectId === project.id}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            {deletingProjectId === project.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </>
    )}
  </article>
))}

            </div>
          )}
        </section>
      </div>
    </main>
  );
}
