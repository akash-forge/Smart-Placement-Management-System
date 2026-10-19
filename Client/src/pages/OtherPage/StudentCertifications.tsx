import { FormEvent, useEffect, useState } from "react";
import apiClient from "../../api/client";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface Certification {
  id: number;
  name: string;
  authority: string;
  issueDate: string;
  credentialUrl?: string | null;
}

export default function StudentCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", authority: "", issueDate: "", credentialUrl: "" });

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/certification");
      setCertifications(res.data);
    } catch (err) {
      console.error("Failed to load certifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/certification", form);
      setForm({ name: "", authority: "", issueDate: "", credentialUrl: "" });
      setShowForm(false);
      fetchCertifications();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add certification.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this certification?")) return;
    try {
      await apiClient.delete(`/certification/${id}`);
      fetchCertifications();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete certification.");
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
            Certifications
          </h1>
        </div>
        <Button
          onClick={() => setShowForm((prev) => !prev)}
          className="!bg-gray-900 !text-white !rounded-none hover:!bg-lime-500 hover:!text-gray-900"
        >
          {showForm ? "Cancel" : "Add Certification"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-700 p-6 mb-8"
        >
          <Input
            type="text"
            placeholder="Certification Name (e.g. AWS Certified Cloud Practitioner)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border rounded px-4 py-2"
          />
          <Input
            type="text"
            placeholder="Issuing Authority (e.g. Amazon Web Services)"
            value={form.authority}
            onChange={(e) => setForm({ ...form, authority: e.target.value })}
            required
            className="w-full border rounded px-4 py-2"
          />
          <Input
            type="date"
            placeholder="Issue Date"
            value={form.issueDate}
            onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
            required
            className="w-full border rounded px-4 py-2"
          />
          <Input
            type="text"
            placeholder="Credential URL (optional)"
            value={form.credentialUrl}
            onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
            className="w-full border rounded px-4 py-2"
          />
          <Button
            type="submit"
            disabled={submitting}
            className="!bg-gray-900 !text-white !rounded-none hover:!bg-lime-500 hover:!text-gray-900 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Certification"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-gray-900 dark:border-gray-700 p-5 animate-pulse">
              <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-white/[0.08]" />
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-white/[0.06] mt-3" />
            </div>
          ))}
        </div>
      ) : certifications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No certifications added yet. Click "Add Certification" to add your first one.
        </p>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="border border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 flex justify-between items-start gap-4"
            >
              <div>
                <h3 className="font-anton uppercase text-lg text-gray-900 dark:text-white">{cert.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Issued by {cert.authority}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {new Date(cert.issueDate).toLocaleDateString()}
                </p>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-lime-600 dark:text-lime-400 underline"
                  >
                    View Credential
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(cert.id)}
                className="text-red-600 hover:text-red-700 text-sm font-semibold uppercase tracking-wide"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
