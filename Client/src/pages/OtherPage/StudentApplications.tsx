import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/client";
import { fileUrl } from "../../utils/fileUrl";

type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "REJECTED" | "HIRED";

interface Application {
  id: number;
  status: ApplicationStatus;
  resumeUrl: string | null;
  appliedAt: string;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    applicationDeadline: string;
  };
}

const STATUS_STYLES: Record<ApplicationStatus, { label: string; className: string }> = {
  APPLIED: { label: "Applied", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400" },
  SHORTLISTED: { label: "Shortlisted", className: "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400" },
  HIRED: { label: "Hired", className: "bg-gray-900 text-lime-400 dark:bg-lime-500 dark:text-gray-900" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
};

export default function StudentApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get("/application/mine");
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id: number) => {
    if (!confirm("Withdraw this application?")) return;
    try {
      await apiClient.delete(`/application/${id}`);
      fetchApplications();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to withdraw application.");
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
            Applications
          </h1>
        </div>
        <Link
          to="/job-page"
          className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-medium bg-gray-900 text-white hover:bg-lime-500 hover:text-gray-900 transition"
        >
          Browse Jobs
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-gray-900 dark:border-gray-700 p-5 animate-pulse">
              <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-white/[0.08]" />
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-white/[0.06] mt-3" />
              <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-white/[0.06] mt-2" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          You haven't applied to any jobs yet. Click "Browse Jobs" to find openings.
        </p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const status = STATUS_STYLES[app.status];
            return (
              <div
                key={app.id}
                className="border border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link
                      to={`/job/${app.job.id}`}
                      className="font-anton uppercase text-lg text-gray-900 dark:text-white hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
                    >
                      {app.job.title}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {app.job.company} · {app.job.location}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-block px-2 py-1 text-xs font-semibold rounded ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()} · {app.job.employmentType}
                </p>

                <div className="mt-3 flex items-center gap-4 text-sm">
                  {app.resumeUrl && (
                    <a
                      href={fileUrl(app.resumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lime-600 dark:text-lime-400 underline"
                    >
                      View submitted resume
                    </a>
                  )}
                  {app.status === "APPLIED" && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="text-red-600 hover:text-red-700 font-semibold uppercase tracking-wide"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
