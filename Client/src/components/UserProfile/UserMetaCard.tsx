import { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxStore/store";
import { DEFAULT_AVATAR_URL } from "../../config/constants";

interface UserMetaProps {
  name: string;
  role: string;
  registerNumber?: string;
  designation?: string;
  department?: string;
  batch?: string;
  year?: number;
  avatarUrl?: string;
}

export default function UserMetaCard() {
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const id = reduxUser?.id || localStorage.getItem("userId");
  const role = reduxUser?.role || localStorage.getItem("role");

  const [user, setUser] = useState<UserMetaProps | null>(null);
  const [formData, setFormData] = useState<UserMetaProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;
    const tempUrl = URL.createObjectURL(file);
    setFormData({ ...formData, avatarUrl: tempUrl });
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await apiClient.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = res.data.avatarUrl;
      setFormData((prev) => prev ? { ...prev, avatarUrl: uploadedUrl } : null);
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Image upload failed");
    }
  };

  const handleSave = async () => {
    if (!formData) {
      console.warn("Form data is missing");
      return;
    }
    const userId = id || reduxUser?.id || localStorage.getItem("userId");
    const userRole = role?.toLowerCase() || reduxUser?.role?.toLowerCase() || localStorage.getItem("role");

    if (!userId || !userRole) {
      console.warn("Missing user ID or role");
      return;
    }

    try {
      await apiClient.put(`/profile/${userId}?role=${userRole}`, formData);
      setUser(formData);
      setEditMode(false);
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update profile.");
    }
  };

  if (loading) return <div className="p-4">Loading user meta...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xl font-bold text-gray-700 dark:text-white">
            {user?.role} PROFILE
          </h4>
          <button
            className="text-xl text-blue-500 hover:underline"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 overflow-hidden rounded-full">
            <img
              className="object-cover w-full h-full"
              src={formData?.avatarUrl || DEFAULT_AVATAR_URL}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_AVATAR_URL; }}
              alt="Avatar"
            />
          </div>

          <div className="space-y-2 text-xl text-gray-600 dark:text-gray-300 w-full">
            {editMode ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xl font-medium">Upload Avatar</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>

                {[
                  { label: "Name", name: "name" },
                  { label: "Designation", name: "designation" },
                  { label: "Department", name: "department" },
                  { label: "Register No", name: "registerNumber" },
                  { label: "Batch", name: "batch" },
                  { label: "Year", name: "year" },
                ].map(({ label, name }) => (
                  <div key={name} className="flex flex-col gap-1">
                    <label htmlFor={name} className="text-xl font-medium">{label}</label>
                    <input
                      type={name === "year" ? "number" : "text"}
                      id={name}
                      name={name}
                      value={formData?.[name as keyof UserMetaProps] ?? ""}
                      onChange={handleChange}
                      className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <button
                  onClick={handleSave}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {user?.name}</p>
                <p className="capitalize"><strong>Role:</strong> {user?.role}</p>
                {user?.department && <p><strong>Department:</strong> {user.department}</p>}
                {user?.designation && <p><strong>Designation:</strong> {user.designation}</p>}
                {user?.registerNumber && <p><strong>Register No:</strong> {user.registerNumber}</p>}
                {user?.batch && <p><strong>Batch:</strong> {user.batch}</p>}
                {user?.year && <p><strong>Year:</strong> {user.year}</p>}
              </>
            )}
          </div>
        </div>
    </div>
  );
}

