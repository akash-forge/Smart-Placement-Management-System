import { ChangeEvent, useEffect, useRef, useState } from "react";
import apiClient from "../../api/client";
import Button from "../../components/ui/button/Button";
import { fileUrl } from "../../utils/fileUrl";

interface ResumeInfo {
  resumeUrl: string | null;
  uploadedAt: string | null;
}

const MAX_BYTES = 5 * 1024 * 1024; // keep in sync with the backend limit

export default function StudentResume() {
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchResume = async () => {
    try {
      const res = await apiClient.get("/resume");
      setResume(res.data);
    } catch (err) {
      console.error("Failed to load resume:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleFileChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again later
    if (!file) return;

    // Quick checks so an obviously-wrong file never leaves the browser; the
    // server re-checks all of this (type, size, real PDF contents) anyway.
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      alert("Resume must be 5 MB or smaller.");
      return;
    }

    const form = new FormData();
    form.append("resume", file);

    setUploading(true);
    try {
      await apiClient.post("/resume", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchResume();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete your resume? You won't be able to apply to jobs until you upload a new one.")) return;
    try {
      await apiClient.delete("/resume");
      await fetchResume();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete resume.");
    }
  };

  const hasResume = !!resume?.resumeUrl;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            <span className="w-2 h-2 bg-lime-500" />
            Student
          </span>
          <h1 className="font-anton uppercase text-4xl leading-[0.95] text-gray-900 dark:text-white mt-2">
            Resume
          </h1>
        </div>
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={uploading || loading}
          className="!bg-gray-900 !text-white !rounded-none hover:!bg-lime-500 hover:!text-gray-900 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : hasResume ? "Replace Resume" : "Upload Resume"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileChosen}
        />
      </div>

      {loading ? (
        <div className="border border-gray-900 dark:border-gray-700 p-5 animate-pulse">
          <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-white/[0.08]" />
          <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-white/[0.06] mt-3" />
        </div>
      ) : !hasResume ? (
        <p className="text-gray-500 dark:text-gray-400">
          No resume uploaded yet. Click "Upload Resume" to add yours (PDF, up to 5 MB). You'll need one before you can apply to jobs.
        </p>
      ) : (
        <div className="border border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 flex justify-between items-start gap-4">
          <div>
            <h3 className="font-anton uppercase text-lg text-gray-900 dark:text-white">My Resume</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">PDF document</p>
            {resume?.uploadedAt && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
              </p>
            )}
            <a
              href={fileUrl(resume!.resumeUrl!)}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-lime-600 dark:text-lime-400 underline inline-block mt-2"
            >
              View Resume
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              This is the resume companies receive when you apply to a job.
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 text-sm font-semibold uppercase tracking-wide shrink-0"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
