const JobsPosted = () => {
    // Dummy job data
    const jobs = [
      { title: "Frontend Developer", location: "Remote", posted: "April 1, 2025" },
      { title: "Backend Engineer", location: "Bangalore", posted: "April 10, 2025" },
    ];
  
    return (
      <div>
        {jobs.map((job, idx) => (
          <div
            key={idx}
            className="mb-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{job.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{job.location}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Posted on: {job.posted}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default JobsPosted;
  