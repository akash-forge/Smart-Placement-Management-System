/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxStore/store";

interface UserInfoProps {
  name: string;
  email: string;
  role: string;
  password?: string;
  phone?: string;
  phoneno?: string;
  department?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  cgpa?: string;
  backlogs?: string;
  address?: string;
  resumeUrl?: string;
  skills: string;
}

export default function UserInfoCard() {
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const id = reduxUser?.id || localStorage.getItem("userId");
  const role = reduxUser?.role || localStorage.getItem("role");

  const [user, setUser] = useState<UserInfoProps | null>(null);
  const [formData, setFormData] = useState<UserInfoProps | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!id || id === "null" || id === "undefined") {
        setError("User ID is invalid or missing.");
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get(`/profile/${id}?role=${role}`);
        setUser(res.data);
        setFormData(res.data);
      } catch (err: any) {
        console.error("Failed to fetch user info:", err);
        setError(err?.response?.data?.message || "Failed to fetch user info.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [id, role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!id || !formData) return;

    try {
      // Determine the correct endpoint based on role
      let endpoint = "";
      const userRole = role?.toUpperCase();
      
      switch (userRole) {
        case "STUDENT":
          endpoint = `/student/${id}`;
          break;
        case "STAFF":
          endpoint = `/staff/${id}`;
          break;
        case "COMPANY":
          endpoint = `/company/${id}`;
          break;
        default:
          endpoint = `/user/${id}`;
      }
      
      await apiClient.patch(endpoint, formData);
      setUser(formData);
      setEditMode(false);
    } catch (err) {
      console.error("Failed to update user info:", err);
      setError("Failed to update user info.");
    }
  };

  if (loading) return <div className="p-4">Loading user info...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-gray-700 dark:text-white">
          {user?.role} INFORMATION
        </h1>
        <button
          className="text-xl text-blue-500 hover:underline"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="space-y-2 text-gray-600 dark:text-gray-300 p-4">
        {editMode ? (
          <div className="space-y-4 text-gray-700 dark:text-gray-300 p-4 text-xl">
            {[
              { label: "Email", name: "email", type: "text" },
              ...(role?.toUpperCase() === "ADMIN"
                ? [{ label: "New Password (leave blank to keep current)", name: "password", type: "password" }]
                : []),
              { label: "Phone", name: "phone", type: "text", value: formData?.phone || formData?.phoneno || "" },
              { label: "Department", name: "department", type: "text" },
              { label: "LinkedIn", name: "linkedin", type: "text" },
              { label: "GitHub", name: "github", type: "text" },
              { label: "Website", name: "website", type: "text" },
              { label: "CGPA", name: "cgpa", type: "text" },
              { label: "Backlogs", name: "backlogs", type: "text" },
              { label: "Resume URL", name: "resumeUrl", type: "text" },
            ].map(({ label, name, type, value }) => (
              <div key={name} className="flex flex-col gap-1">
                <label htmlFor={name} className="text-xl font-medium">{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={value ?? (formData?.[name as keyof UserInfoProps] || "")}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {[
              { label: "Address", name: "address" },
              { label: "Skills", name: "skills" },
            ].map(({ label, name }) => (
              <div key={name} className="flex flex-col gap-1">
                <label htmlFor={name} className="text-xl font-medium">{label}</label>
                <textarea
                  id={name}
                  name={name}
                  rows={3}
                  value={formData?.[name as keyof UserInfoProps] || ""}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-xl">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone || user?.phoneno}</p>
              {user?.department && <p><strong>Department:</strong> {user.department}</p>}
              {user?.linkedin && <p><strong>LinkedIn:</strong> {user.linkedin}</p>}
              {user?.github && <p><strong>GitHub:</strong> {user.github}</p>}
              {user?.website && <p><strong>Website:</strong> {user.website}</p>}
              {user?.cgpa && <p><strong>CGPA:</strong> {user.cgpa}</p>}
              {user?.backlogs && <p><strong>Backlogs:</strong> {user.backlogs}</p>}
              {user?.address && <p><strong>Address:</strong> {user.address}</p>}
              {user?.resumeUrl && (
                <p>
                  <strong>Resume:</strong> <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a>
                </p>
              )}
              {user?.skills && <p><strong>Skills:</strong> {user.skills}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

