import { FormEvent, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxStore/store";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import apiClient from "../../api/client";

export default function CompanyJobPost() {
  const verificationStatus = useSelector((state: RootState) => state.auth.user?.verificationStatus);
  const isVerified = verificationStatus === "VERIFIED";

  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    responsibilities: "",
    postedDate: "",
    salaryMin: "",
    salaryMax: "",
    employmentType: "Full-time",
    benefits: "",
    applicationDeadline: "",
    contactEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isVerified) return;
    setSubmitting(true);

    const payload = {
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: job.requirements
        .split(",")
        .map((req) => req.trim())
        .filter((req) => req !== ""),
      responsibilities: job.responsibilities
        .split(",")
        .map((res) => res.trim())
        .filter((res) => res !== ""),
      postedDate: new Date().toISOString(),
      salaryMin: job.salaryMin ? Number(job.salaryMin) : undefined,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : undefined,
      employmentType: job.employmentType,
      benefits: job.benefits
        .split(",")
        .map((b) => b.trim())
        .filter((b) => b !== ""),
      applicationDeadline: job.applicationDeadline,
      contactEmail: job.contactEmail,
    };

    try {
      // Was a raw `fetch` with no auth header — POST /jobs now requires a
      // valid token (COMPANY/STAFF/ADMIN), so this silently 401'd for every
      // company user. apiClient attaches the token automatically.
      await apiClient.post("/jobs", payload);
      alert("Job posted successfully!");
      setJob({
        title: "",
        company: "",
        location: "",
        description: "",
        requirements: "",
        responsibilities: "",
        postedDate: "",
        salaryMin: "",
        salaryMax: "",
        employmentType: "Full-time",
        benefits: "",
        applicationDeadline: "",
        contactEmail: "",
      });
    } catch (err: any) {
      console.error("Error posting job:", err);
      alert(err?.response?.data?.message || "Failed to post job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Headline treatment matches the rest of the job section: bold
          condensed display type + a small lime tag, echoing the reference's
          "DESIGN FUTURES." hero. */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
          <span className="w-2 h-2 bg-lime-500" />
          Company · New Listing
        </span>
        <h1 className="font-anton uppercase text-4xl sm:text-5xl leading-[0.95] text-gray-900 dark:text-white mt-2">
          Post a<br />
          <span className="text-lime-600 dark:text-lime-400">New Job.</span>
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-700 p-6 sm:p-8"
      >
        <Input
          type="text"
          name="title"
          placeholder="Job Title"
          value={job.title}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />
        <Input
          type="text"
          name="company"
          placeholder="Company Name"
          value={job.company}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />
        <Input
          type="text"
          name="location"
          placeholder="Location"
          value={job.location}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={job.description}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />
        <Input
          type="text"
          name="requirements"
          placeholder="Requirements (comma separated)"
          value={job.requirements}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        />
        <Input
          type="text"
          name="responsibilities"
          placeholder="Responsibilities (comma separated)"
          value={job.responsibilities}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        />
        <div className="flex gap-4">
          <Input
            type="number"
            name="salaryMin"
            placeholder="Min Salary"
            value={job.salaryMin}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          />
          <Input
            type="number"
            name="salaryMax"
            placeholder="Max Salary"
            value={job.salaryMax}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          />
        </div>
        <select
          name="employmentType"
          value={job.employmentType}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Temporary">Temporary</option>
          <option value="Internship">Internship</option>
        </select>
        <Input
          type="text"
          name="benefits"
          placeholder="Benefits (comma separated)"
          value={job.benefits}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        />
        <Input
          type="date"
          name="applicationDeadline"
          value={job.applicationDeadline}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />
        <Input
          type="email"
          name="contactEmail"
          placeholder="Contact Email"
          value={job.contactEmail}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />
        <Button
          type="submit"
          disabled={submitting || !isVerified}
          className="w-full sm:w-auto !bg-gray-900 !text-white px-8 py-3 font-anton uppercase tracking-wide !rounded-none hover:!bg-lime-500 hover:!text-gray-900 transition-colors disabled:opacity-60"
        >
          {!isVerified ? "Pending Verification" : submitting ? "Posting..." : "Post Job →"}
        </Button>
      </form>
    </div>
  );
}
