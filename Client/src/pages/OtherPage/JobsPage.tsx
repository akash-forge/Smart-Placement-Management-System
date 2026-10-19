import { useEffect, useState } from "react";
import EditJobModal from "../Forms/EditJobModal";
import Button from "../../components/ui/button/Button";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxStore/store";
import apiClient from "../../api/client";

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    postedDate: string;
    description: string;
    employmentType: string;
    salaryMin?: number;
    salaryMax?: number;
    applicationDeadline: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Only company/staff/admin can post, edit, or delete jobs — students
    // should only be able to browse and open a listing.
    const role = useSelector((state: RootState) => state.auth.user?.role);
    const canManageJobs = role === "COMPANY" || role === "STAFF" || role === "ADMIN";

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Was a raw, unauthenticated `fetch` — GET /jobs now requires a
            // valid token, so this 401'd silently for every role (student,
            // staff, and company alike saw an empty/broken list).
            const res = await apiClient.get("/jobs");
            setJobs(res.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (id: number) => {
        const confirmed = confirm("Are you sure you want to delete this job?");
        if (!confirmed) return;

        try {
            await apiClient.delete(`/jobs/${id}`);
            fetchJobs();
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete job.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="mb-8">
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
                    <span className="w-2 h-2 bg-lime-500" />
                    Open Roles
                </span>
                <h1 className="font-anton uppercase text-4xl sm:text-5xl leading-[0.95] text-gray-900 dark:text-white mt-2">
                    Available<br />
                    <span className="text-lime-600 dark:text-lime-400">Jobs.</span>
                </h1>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="relative border border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 animate-pulse"
                        >
                            <div className="h-6 w-2/3 rounded bg-gray-200 dark:bg-white/[0.08]" />
                            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-white/[0.06] mt-3" />
                            <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-white/[0.06] mt-2" />
                            <div className="h-4 w-full rounded bg-gray-200 dark:bg-white/[0.06] mt-4" />
                            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-white/[0.06] mt-2" />
                        </div>
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <p className="text-gray-500">No jobs found.</p>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job, index) => (
                        <div
                            key={job.id}
                            className="relative border border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 hover:border-lime-500 transition-colors"
                        >
                            <span className="absolute top-0 right-0 bg-gray-900 text-lime-400 font-anton text-xs px-2 py-1">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <Link
                                to={`/job/${job.id}`}
                                className="font-anton uppercase text-xl sm:text-2xl text-gray-900 dark:text-white hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
                            >
                                {job.title}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {job.company} · {job.location}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {job.employmentType} · ₹{job.salaryMin ?? "-"} – ₹{job.salaryMax ?? "-"}
                            </p>
                            <p className="mt-3 text-gray-700 dark:text-gray-300">
                                {job.description.slice(0, 150)}...
                            </p>
                            <p className="text-xs text-gray-400 mt-3">
                                Posted: {new Date(job.postedDate).toLocaleDateString()} · Apply by:{" "}
                                {new Date(job.applicationDeadline).toLocaleDateString()}
                            </p>

                            {canManageJobs && (
                                <div className="mt-4 flex gap-3">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setIsModalOpen(true);
                                        }}
                                        className="!bg-gray-900 !text-white !rounded-none hover:!bg-lime-500 hover:!text-gray-900"
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleDelete(job.id)}
                                        className="!bg-white !text-gray-900 !rounded-none ring-1 ring-inset ring-gray-900 hover:!bg-red-600 hover:!text-white"
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <EditJobModal
                job={selectedJob}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchJobs}
            />
        </div>
    );
}
