import { FormEvent, useEffect, useState } from "react";
import apiClient from "../../api/client";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  duration?: string | null;
  link?: string | null;
}

export default function StudentProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", technologies: "", duration: "", link: "" });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/project");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/project", {
        title: form.title,
        description: form.description,
        technologies: form.technologies
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
        duration: form.duration,
        link: form.link,
      });
      setForm({ title: "", description: "", technologies: "", duration: "", link: "" });
      setShowForm(false);
      fetchProjects();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try {
      await apiClient.delete(`/project/${id}`);
      fetchProjects();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete project.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            <span className="w-2 h-2 bg-lime-500" />
            Student
          </span>
          <h1 className="font-anton uppercase text-4xl leading-[0.95] text-gray-900 dark:text-white mt-2">
            Projects
          </h1>
        </div>
        <Button
          onClick={() => setShowForm((prev) => !prev)}
          className="!bg-gray-900 !text-white !rounded-none hover:!bg-lime-500 hover:!text-gray-900"
        >
          {showForm ? "Cancel" : "Add Project"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-700 p-6 mb-8"
        >
          <Input
            type="text"
            placeholder="Project Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full border rounded px-4 py-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            className="w-full border rounded px-4 py-2"
          />
          <Input
            type="text"
            placeholder="Technologies (comma separated, e.g. React, Node.js, Solidity)"
            value={form.technologies}
            onChange={(e) => setForm({ ...form, technologies: e.target.value })}
            className="w-full border rounded px-4 py-2"
          />
          <Input
            type="text"
            placeholder="Duration (e.g. Jan 2024 - Mar 2024)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="w-full border rounded px-4 py-2"
          />
          <Input
            type="text"
            placeholder="Project Link (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="w-full border rounded px-4 py-2"
          />
          <Button
            type="submit"
            disabled={submitting}
            className="!bg-gray-900 !text-white !rounded-none hover:!bg-lime-500 hover:!text-gray-900 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Project"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-gray-900 dark:border-gray-700 p-5 animate-pulse">
              <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-white/[0.08]" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-white/[0.06] mt-3" />
              <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-white/[0.06] mt-2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No projects added yet. Click "Add Project" to add your first one.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
            >
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-anton uppercase text-lg text-gray-900 dark:text-white">{project.title}</h3>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold uppercase tracking-wide shrink-0"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{project.description}</p>
              {project.duration && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Duration: {project.duration}</p>
              )}
              {project.technologies?.length > 0 && (
                <p className="text-sm text-gray-800 dark:text-gray-300 mt-1">
                  Tech Stack: {project.technologies.join(", ")}
                </p>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-lime-600 dark:text-lime-400 underline mt-2 inline-block"
                >
                  View Project
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
