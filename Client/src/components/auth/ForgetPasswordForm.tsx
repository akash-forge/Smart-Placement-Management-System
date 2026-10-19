import React from "react";
import { Link } from "react-router-dom";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function ForgetPasswordForm() {
  // const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    // console.log("Reset email sent to:", email);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto my-auto sm:pt-10">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Back to Sign In
        </Link>

        <div className="mt-8">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Forgot Password?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <Label htmlFor="email">Email address</Label>
           <Input />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-sm font-medium text-white transition bg-brand-500 rounded-lg shadow-theme-xs hover:bg-brand-600"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
          Remembered your password?{" "}
          <Link
            to="/signin"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

