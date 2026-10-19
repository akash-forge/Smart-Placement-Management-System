import { useEffect, useState } from "react";
import apiClient from "../../api/client";

// Previously this page showed four hardcoded names ("Arjun Mehta",
// "Neha Sharma"...) that never changed no matter what was actually in the
// database. Now it reads real students from GET /student.
//
// Note: the schema only tracks a PLACED/UNPLACED boolean on Student (no
// link to which company or what package) — so unlike the old fake data,
// this report can't show a "Company" or "Package" column truthfully. If you
// want that, it needs an Application/Placement table linking Student to Job
// with an offer package, which doesn't exist yet.
interface StudentReportEntry {
  id: number;
  name: string;
  registerNumber: string;
  department: string;
  batch: string;
  year: number;
  status: "PLACED" | "UNPLACED";
}

export default function ReportPage() {
  const [students, setStudents] = useState<StudentReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiClient.get("/student");
        setStudents(res.data);
      } catch (err: any) {
        console.error("Failed to fetch report data:", err);
        setError(err?.response?.data?.message || "Failed to load report data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const placedCount = students.filter((s) => s.status === "PLACED").length;

  const handleExportCsv = () => {
    const headers = ["Name", "Register Number", "Department", "Batch", "Year", "Status"];
    const rows = students.map((s) => [s.name, s.registerNumber, s.department, s.batch, s.year, s.status]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `placement-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            <span className="w-2 h-2 bg-lime-500" />
            Admin · Staff
          </span>
          <h1 className="font-anton uppercase text-3xl sm:text-4xl leading-[0.95] text-gray-900 dark:text-white mt-2">
            Placement Report
          </h1>
          {!loading && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {placedCount} of {students.length} students placed
            </p>
          )}
        </div>
        <button
          onClick={handleExportCsv}
          disabled={loading || students.length === 0}
          className="px-6 py-2.5 bg-gray-900 text-white font-anton uppercase tracking-wide hover:bg-lime-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export Report (CSV)
        </button>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-700">
        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-white/[0.03] text-xs uppercase font-semibold border-b border-gray-100 dark:border-white/[0.05]">
            <tr>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Register Number</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Batch</th>
              <th className="px-6 py-4">Year</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/[0.08]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-red-500">{error}</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.name}</td>
                  <td className="px-6 py-4">{student.registerNumber}</td>
                  <td className="px-6 py-4">{student.department}</td>
                  <td className="px-6 py-4">{student.batch}</td>
                  <td className="px-6 py-4">{student.year}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        student.status === "PLACED"
                          ? "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400"
                          : "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400"
                      }`}
                    >
                      {student.status === "PLACED" ? "Placed" : "Not Placed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
