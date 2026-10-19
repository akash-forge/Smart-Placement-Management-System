import { Building2, UserCheck2, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "../../api/client";

interface MetricsData {
  staffs: number;
  students: number;
  companies: number;
  placedStudents: number;
  status: string;
}

const statCards = [
  { key: "staffs" as const, label: "Staffs", icon: UserPlus },
  { key: "students" as const, label: "Students", icon: Users },
  { key: "companies" as const, label: "Companies", icon: Building2 },
  { key: "placedStudents" as const, label: "Placed Students", icon: UserCheck2 },
];

export default function PlacementMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    staffs: 0,
    students: 0,
    companies: 0,
    placedStudents: 0,
    status: "PLACED",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Was a raw, unauthenticated `axios.get` — GET /metrics now
        // requires a valid ADMIN/STAFF token, so this 401'd silently and
        // every card was permanently stuck at 0 regardless of real data.
        const res = await apiClient.get("/metrics");
        setMetrics(res.data);
      } catch (error) {
        console.error("Failed to fetch placement metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="border border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center justify-center w-10 h-10 bg-gray-900 text-lime-400 dark:bg-white dark:text-gray-900">
              <Icon size={18} />
            </span>
            <span className="w-2 h-2 bg-lime-500" />
          </div>

          {loading ? (
            <div className="mt-5 h-9 w-16 rounded bg-gray-200 dark:bg-white/[0.08] animate-pulse" />
          ) : (
            <h4 className="mt-5 font-anton text-4xl text-gray-900 dark:text-white">
              {metrics[key]}
              <span className="text-lime-600 dark:text-lime-400">+</span>
            </h4>
          )}
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
