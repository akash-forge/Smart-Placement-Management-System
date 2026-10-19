const EditCompanyProfile = () => {
    return (
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Name
          </label>
          <input
            type="text"
            placeholder="TechNova Pvt. Ltd."
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Website
          </label>
          <input
            type="text"
            placeholder="www.technova.com"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Email
          </label>
          <input
            type="email"
            placeholder="hr@technova.com"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <button className="px-6 py-2 mt-4 text-white bg-brand-500 rounded hover:bg-brand-600">
          Save Changes
        </button>
      </form>
    );
  };
  
  export default EditCompanyProfile;
  