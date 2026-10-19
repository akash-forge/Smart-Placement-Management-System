export default function CompanyApplications() {
    const applications = [
      {
        studentName: "Aditi Sharma",
        email: "aditi@example.com",
        department: "CSE",
        resume: "/resumes/aditi_resume.pdf",
        status: "Under Review",
      },
      {
        studentName: "Ravi Kumar",
        email: "ravi@example.com",
        department: "ECE",
        resume: "/resumes/ravi_resume.pdf",
        status: "Shortlisted",
      },
    ];
  
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Applications Received</h2>
        <table className="w-full border-collapse bg-white shadow rounded-lg">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Email</th>
              <th className="p-4">Department</th>
              <th className="p-4">Resume</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr key={index} className="border-t text-sm">
                <td className="p-4">{app.studentName}</td>
                <td className="p-4">{app.email}</td>
                <td className="p-4">{app.department}</td>
                <td className="p-4">
                  <a
                    href={app.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Resume
                  </a>
                </td>
                <td className="p-4">{app.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  