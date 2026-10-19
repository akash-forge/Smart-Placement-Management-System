import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxStore/store";
import apiClient from "../../api/client";

// Matches what GET /jobs/:id actually returns (the Job model). This page
// previously declared fields the model doesn't have (stipend, eligibility,
// lastDate, department), so the salary, deadline and employment type never
// showed up at all.
interface JobDetails {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits?: string[] | null;
  employmentType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  postedDate: string;
  applicationDeadline: string;
  contactEmail?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const formatSalary = (min?: number | null, max?: number | null) => {
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
};

export default function JobDescriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const isStudent = user?.role === "STUDENT";
  const isVerified = user?.verificationStatus === "VERIFIED";

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await apiClient.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchJob();
  }, [id]);

  // Students: find out whether they've already applied to this job, so the
  // button shows "Applied" instead of inviting a second (rejected) attempt.
  useEffect(() => {
    if (!isStudent || !id) return;
    apiClient
      .get("/application/mine")
      .then((res) => setApplied(res.data.some((a: { job: { id: number } }) => a.job.id === Number(id))))
      .catch(() => {});
  }, [isStudent, id]);

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      await apiClient.post("/application", { jobId: job.id });
      setApplied(true);
    } catch (err: any) {
      const data = err?.response?.data;
      alert(data?.message || "Failed to submit application.");
      if (data?.code === "RESUME_REQUIRED") navigate("/resume");
      if (data?.code === "ALREADY_APPLIED") setApplied(true);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center py-10 text-red-600">Job not found</div>;
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const deadline = new Date(job.applicationDeadline);
  const deadlinePassed = deadline.getTime() + DAY_MS < Date.now();

  const sectionTitle =
    "font-anton uppercase text-lg text-gray-900 dark:text-white border-b border-gray-900 dark:border-gray-700 pb-1";
  const metaLine = "text-sm text-gray-600 dark:text-gray-300";

  const renderList = (items?: string[] | null) =>
    items && items.length > 0 ? (
      <ul className="list-none pl-0 text-gray-700 dark:text-gray-300 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-lime-600 dark:text-lime-400 mt-1">▸</span>
            {item}
          </li>
        ))}
      </ul>
    ) : null;

  // The Apply control: only students apply (it isn't shown to company/staff/
  // admin), and the label always says why it's unavailable when it is.
  let applyLabel = "Apply Now →";
  let applyDisabled = false;
  if (applied) {
    applyLabel = "Applied ✓";
    applyDisabled = true;
  } else if (!isVerified) {
    applyLabel = "Pending Verification";
    applyDisabled = true;
  } else if (deadlinePassed) {
    applyLabel = "Applications Closed";
    applyDisabled = true;
  } else if (applying) {
    applyLabel = "Applying...";
    applyDisabled = true;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-700 p-6 sm:p-8 space-y-6">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            <span className="w-2 h-2 bg-lime-500" />
            {job.company}
          </span>
          <h1 className="font-anton uppercase text-3xl sm:text-4xl leading-[0.95] text-gray-900 dark:text-white mt-2">
            {job.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.location}</p>
        </div>

        <div className="space-y-2">
          <p className={metaLine}>
            <strong>Employment Type:</strong> {job.employmentType}
          </p>
          {salary && (
            <p className={metaLine}>
              <strong>Salary:</strong> {salary}
            </p>
          )}
          <p className={metaLine}>
            <strong>Posted:</strong> {new Date(job.postedDate).toLocaleDateString()}
          </p>
          <p className={metaLine}>
            <strong>Apply By:</strong> {deadline.toLocaleDateString()}
            {deadlinePassed && <span className="text-red-600 dark:text-red-400"> (closed)</span>}
          </p>
          {job.contactEmail && (
            <p className={metaLine}>
              <strong>Contact:</strong> {job.contactEmail}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className={sectionTitle}>Description</h2>
          <p className="text-gray-700 dark:text-gray-300">{job.description}</p>
        </div>

        {job.responsibilities?.length > 0 && (
          <div className="space-y-2">
            <h2 className={sectionTitle}>Responsibilities</h2>
            {renderList(job.responsibilities)}
          </div>
        )}

        {job.requirements?.length > 0 && (
          <div className="space-y-2">
            <h2 className={sectionTitle}>Requirements</h2>
            {renderList(job.requirements)}
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div className="space-y-2">
            <h2 className={sectionTitle}>Benefits</h2>
            {renderList(job.benefits)}
          </div>
        )}

        {isStudent && (
          <div className="pt-4 flex items-center gap-4 flex-wrap">
            <button
              onClick={handleApply}
              disabled={applyDisabled}
              className="px-8 py-3 bg-gray-900 text-white font-anton uppercase tracking-wide hover:bg-lime-500 hover:text-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-gray-900 disabled:hover:text-white"
            >
              {applyLabel}
            </button>
            {applied && (
              <Link to="/application" className="text-sm text-lime-600 dark:text-lime-400 underline">
                View my applications
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
