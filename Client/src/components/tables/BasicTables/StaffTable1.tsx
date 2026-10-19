import { useEffect, useState } from "react";
import apiClient from "../../../api/client";
import { DEFAULT_AVATAR_URL } from "../../../config/constants";
import TableSkeletonRows from "../../common/TableSkeleton";

interface Staff {
  id: number;
  name: string;
  staffId?: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  user: {
    id: number;
    avatarUrl?: string;
  }
}

export default function StaffTable() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await apiClient.get("/staff");
        setStaffs(res.data);
      } catch (err) {
        console.error("Failed to load companies", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  const COLUMN_COUNT = 7;

  const renderStaffRows = () => {
    const rows = [];

    for (let i = 0; i < staffs.length; i++) {
      const staff = staffs[i];
      rows.push(
        <tr key={staff.id}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src={staff.user?.avatarUrl || DEFAULT_AVATAR_URL}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_AVATAR_URL; }}
                alt={staff.name || "unknown"}
                className="rounded-full w-10 h-10 object-cover"
              />
            </div>
          </td>
          <td className="px-4 py-3">
            <span className="font-medium text-gray-800 dark:text-white/90">
              {staff.name || "Unknown"}
            </span>
          </td>
          <td className="px-4 py-3">{staff.staffId || "N/A"}</td>
          <td className="px-4 py-3">{staff.email || "N/A"}</td>
          <td className="px-4 py-3">{staff.phone || "N/A"}</td>
          <td className="px-4 py-3">{staff.department || "N/A"}</td>
          <td className="px-4 py-3">{staff.designation || "N/A"}</td>
        </tr>
      );
    }

    return rows;
  };
  return (
   <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Profile</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Staff Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Staff ID</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Email ID</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Mobile Number</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Department</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80">Designation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableSkeletonRows columns={COLUMN_COUNT} />
            ) : staffs.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No staff found.
                </td>
              </tr>
            ) : (
              renderStaffRows()
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

