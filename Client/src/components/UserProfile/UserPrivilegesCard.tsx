import { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxStore/store";

interface UserPrivilegesProps {
  role: string;
}

export default function UserPrivilegesCard() {
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  const id = reduxUser?.id || localStorage.getItem("userId");
  const role = reduxUser?.role || localStorage.getItem("role");

  const [user, setUser] = useState<UserPrivilegesProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!id || id === "null" || id === "undefined") {
        console.warn("User ID is invalid or missing:", id);
        setError("User ID is invalid or missing.");
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get(`/profile/${id}?role=${role}`);
        setUser(res.data);
      } catch (err: any) {
        console.error("Failed to fetch user info:", err);
        setError(err?.response?.data?.message || "Failed to fetch user info.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [id, role]);

  if (loading) return <div className="p-4">Loading user info...</div>;

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h4 className="mb-3 text-xl font-semibold text-gray-700 dark:text-white">
        {user?.role} PRIVILEGES
      </h4>
      <ul className="list-disc ml-6 space-y-1 text-xl text-gray-700 dark:text-gray-300">
        {user?.role === "ADMIN" && (
          <>
            <li>Full access to all resources</li>
            <li>Manage all users and roles</li>
            <li>View complete placement statistics</li>
            <li>Approve or remove staff and companies</li>
            <li>Monitor platform activity and logs</li>
          </>
        )}

        {user?.role === "STAFF" && (
          <>
            <li>Manage students and placements</li>
            <li>Create and edit job postings</li>
            <li>Track student applications</li>
            <li>Assign students to companies</li>
            <li>Generate placement reports</li>
          </>
        )}

        {user?.role === "STUDENT" && (
          <>
            <li>Apply to jobs, manage resume</li>
            <li>View application status</li>
            <li>Attend placement drives</li>
            <li>Upload certifications and projects</li>
            <li>Receive placement notifications</li>
          </>
        )}

        {user?.role === "COMPANY" && (
          <>
            <li>Post jobs, view applications</li>
            <li>Shortlist students</li>
            <li>Schedule interviews</li>
            <li>Download student resumes</li>
            <li>Track hiring progress</li>
          </>
        )}

        {user?.role === null && (
          <li>No privileges found</li>
        )}
      </ul>
    </div>
  );
}
