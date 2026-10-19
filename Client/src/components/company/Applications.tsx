const Applications = () => {
    const applications = [
      { student: "Ravi Kumar", job: "Frontend Developer", status: "Pending" },
      { student: "Ayesha Singh", job: "Backend Engineer", status: "Reviewed" },
    ];
  
    return (
      <div>
        {applications.map((app, idx) => (
          <div
            key={idx}
            className="mb-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
          >
            <h4 className="font-semibold text-gray-800 dark:text-white">{app.student}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Applied for: {app.job}</p>
            <span
              className={`inline-block px-3 py-1 mt-1 text-xs rounded-full ${
                app.status === "Pending"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-green-200 text-green-800"
              }`}
            >
              {app.status}
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  export default Applications;
  