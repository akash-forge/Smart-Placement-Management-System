import { useEffect, useState } from "react";
import apiClient from "../../../api/client";
import { DEFAULT_AVATAR_URL } from "../../../config/constants";
import TableSkeletonRows from "../../common/TableSkeleton";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  registerNumber: string;
  department: string;
  batch: string;
  year?: string;
  resumeUrl?: string;
  cgpa?: string;
  skills?: string;
  status: string;
  user: {
    avatarUrl?: string;
  }
}


export default function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiClient.get("/student");
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to load companies", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const renderStudentRows = () => {
    const rows = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      rows.push(
        <tr key={student.id}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src={student.user?.avatarUrl || DEFAULT_AVATAR_URL}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_AVATAR_URL; }}
                alt={student.name || "unknown"}
                className="rounded-full w-10 h-10 object-cover"
              />
            </div>
          </td>
          <td className="px-4 py-3">
            <span className="font-medium text-gray-800 dark:text-white/90">
              {student.name || "Unknown"}
            </span>
          </td>
          <td className="px-4 py-3">{student.email || "N/A"}</td>
          <td className="px-4 py-3">{student.phone || "N/A"}</td>
          <td className="px-4 py-3">{student.registerNumber || "N/A"}</td>
          <td className="px-4 py-3">{student.department || "N/A"}</td>
          <td className="px-4 py-3">{student.batch || "N/A"}</td>
          <td className="px-4 py-3">{student.year || "N/A"}</td>
          <td className="px-4 py-3">
            {student.resumeUrl ? (
              <a
                href={student.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                {student.resumeUrl}
              </a>
            ) : (
              <span className="text-gray-400 italic">N/A</span>
            )}
          </td>
          <td className="px-4 py-3">{student.cgpa || "N/A"}</td>
          <td className="px-4 py-3">{student.skills || "N/A"}</td>
          <td className="px-4 py-3">
            {student.status ? (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${student.status.toLowerCase() === "placed"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                {student.status}
              </span>
            ) : (
              <span className="text-gray-400 italic">N/A</span>
            )}
          </td>
        </tr>
      );
    }

    return rows;
  };
  const COLUMN_COUNT = 12;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Profile</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Student Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Email ID</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Mobile Number</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Register Number</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Department</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Batch</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Year</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Resume URL</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">CGPA</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Skills</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableSkeletonRows columns={COLUMN_COUNT} />
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              renderStudentRows()
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
