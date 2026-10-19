// src/api/reports.ts
export type Report = {
  id: number;
  student: string;
  company: string;
  interviewDate: string;
  status: "Scheduled" | "Completed" | "Missed";
  feedback: string;
};

export const fetchReports = async (): Promise<Report[]> => {
  const response = await fetch("http://localhost:3000/api/reports");
  if (!response.ok) throw new Error("Failed to fetch reports");
  return await response.json();
};
