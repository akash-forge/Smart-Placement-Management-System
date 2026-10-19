import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Eye, EyeOff } from "lucide-react";
import Checkbox from "../form/input/Checkbox";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../reduxStore/store";
import { login } from "../../reduxStore/authSlice";
import apiClient from "../../api/client";
import { DEFAULT_AVATAR_URL } from "../../config/constants";

type FormData = {
  name: string;
  email: string;
  phoneno: string;
  password: string;
  confirmPassword: string;
  role: "ADMIN" | "STAFF" | "STUDENT" | "COMPANY";
  // Student-only
  registerNumber?: string;
  department?: string;
  batch?: string;
  year?: string;
  // Staff-only
  staffId?: string;
  designation?: string;
};

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const password = watch("password");
  const selectedRole = watch("role");

  // The same "name" field feeds both the User record and the role's own
  // profile record, so its label/placeholder adapts to the chosen role.
  const nameLabel =
    selectedRole === "COMPANY" ? "Company Name" : selectedRole === "ADMIN" ? "Admin Name" : "Full Name";

  // Previously this form always posted to the generic `/user` endpoint,
  // which only ever creates a bare User row — never the linked
  // Student/Staff/Company row that the Profile page (and most of the rest
  // of the app) actually reads from. Every account signed up through this
  // form was structurally guaranteed to hit "Profile not found" the moment
  // it tried to view its own profile. Now each role posts to its matching
  // endpoint (which creates the User + linked profile row together in one
  // request), with the extra fields each role's table actually requires.
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const userData = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      phoneno: data.phoneno,
      // A real default avatar is set here (server-side, on the actual
      // record) rather than only ever falling back to one at render time —
      // that way every consumer of this data (API responses, other pages)
      // sees a real value instead of null.
      avatarUrl: DEFAULT_AVATAR_URL,
    };

    try {
      let response;

      switch (data.role) {
        case "STUDENT":
          response = await apiClient.post("/student", {
            name: data.name,
            email: data.email,
            phone: data.phoneno,
            registerNumber: data.registerNumber,
            department: data.department,
            batch: data.batch,
            year: data.year,
            userData,
          });
          break;

        case "STAFF":
          response = await apiClient.post("/staff", {
            name: data.name,
            email: data.email,
            phone: data.phoneno,
            staffId: data.staffId,
            department: data.department,
            designation: data.designation,
            userData,
          });
          break;

        case "COMPANY":
          response = await apiClient.post("/company", {
            name: data.name,
            email: data.email,
            phone: data.phoneno,
            userData,
          });
          break;

        default:
          // ADMIN has no separate profile table in the schema — a plain
          // User row is correct for this role.
          response = await apiClient.post("/user", {
            name: data.name,
            email: data.email,
            phoneno: data.phoneno,
            role: data.role,
            password: data.password,
            avatarUrl: DEFAULT_AVATAR_URL,
          });
      }

      if (response.status === 201) {
        // Registration succeeded but doesn't itself return a token — reuse
        // the existing login endpoint with the same credentials so the
        // person lands straight in the app (restricted, pending-badge
        // showing) instead of being sent to a separate Sign In step.
        const loginRes = await apiClient.post("/user/login", {
          email: data.email,
          password: data.password,
        });

        if (loginRes.data?.userData && loginRes.data?.token) {
          dispatch(login({ user: loginRes.data.userData, token: loginRes.data.token }));
          navigate("/");
        } else {
          // Account was created but auto-login didn't return the expected
          // shape — fall back to a normal sign-in rather than leaving the
          // person stuck on a spinner.
          navigate("/signin");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      {/* Back to dashboard */}
      <div className="w-full max-w-md mx-auto mt-6 mb-4">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="flex flex-col justify-center w-full max-w-md mx-auto pb-10">
        {/* Heading */}
        <div className="mb-5 sm:mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            <span className="w-2 h-2 bg-lime-500" />
            Placement Cell
          </span>
          <h1 className="mb-2 mt-2 text-3xl font-anton uppercase text-gray-800 dark:text-white">
            Register
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create your account — your details are reviewed before you get full access.
          </p>
        </div>

        {/* Divider */}
        <div className="relative py-3 sm:py-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 text-gray-500 bg-white dark:bg-gray-900">Or</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Role<span className="text-red-500">*</span></Label>
            <select
              {...register("role", { required: "Role is required" })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="">Select Role</option>
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
              <option value="COMPANY">Company</option>
            </select>
          </div>

          <div>
            <Label>{nameLabel}<span className="text-red-500">*</span></Label>
            <Input
              type="text"
              placeholder={nameLabel}
              {...register("name", { required: `${nameLabel} is required` })}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>
          <div>
            <Label>Email<span className="text-red-500">*</span></Label>
            <Input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={!!errors.email}
              hint={errors.email?.message}
            />
          </div>
          <div>
            <Label>Phone Number<span className="text-red-500">*</span></Label>
            <Input
              type="tel"
              placeholder="Phone Number"
              {...register("phoneno", { required: "Phone Number is required" })}
              error={!!errors.phoneno}
              hint={errors.phoneno?.message}
            />
          </div>
          {/* Role-specific required fields. These map directly to columns
              that are required (and, for registerNumber, unique) on the
              Student/Staff tables — skipping them isn't just incomplete
              data, the signup request would be rejected outright without
              them. */}
          {selectedRole === "STUDENT" && (
            <>
              <div>
                <Label>Register Number<span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  placeholder="Register Number"
                  {...register("registerNumber", { required: "Register number is required" })}
                  error={!!errors.registerNumber}
                  hint={errors.registerNumber?.message}
                />
              </div>
              <div>
                <Label>Department<span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  placeholder="e.g. Computer Science"
                  {...register("department", { required: "Department is required" })}
                  error={!!errors.department}
                  hint={errors.department?.message}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Batch<span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="e.g. 2023-2027"
                    {...register("batch", { required: "Batch is required" })}
                    error={!!errors.batch}
                    hint={errors.batch?.message}
                  />
                </div>
                <div className="flex-1">
                  <Label>Year<span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    placeholder="e.g. 3"
                    {...register("year", { required: "Year is required" })}
                    error={!!errors.year}
                    hint={errors.year?.message}
                  />
                </div>
              </div>
            </>
          )}

          {selectedRole === "STAFF" && (
            <>
              <div>
                <Label>Staff ID<span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  placeholder="Staff ID"
                  {...register("staffId", { required: "Staff ID is required" })}
                  error={!!errors.staffId}
                  hint={errors.staffId?.message}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  type="text"
                  placeholder="e.g. Placement Cell"
                  {...register("department")}
                />
              </div>
              <div>
                <Label>Designation<span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  placeholder="e.g. Placement Officer"
                  {...register("designation", { required: "Designation is required" })}
                  error={!!errors.designation}
                  hint={errors.designation?.message}
                />
              </div>
            </>
          )}

          <div>
            <Label>Password<span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={!!errors.password}
                hint={errors.password?.message}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
              </span>
            </div>
          </div>

          <div>
            <Label>Confirm Password<span className="text-red-500">*</span></Label>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              error={!!errors.confirmPassword}
              hint={errors.confirmPassword?.message}
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By signing up, you agree to our{" "}
              <span className="text-gray-800 dark:text-white font-medium">Terms</span> and{" "}
              <span className="text-gray-800 dark:text-white font-medium">Privacy Policy</span>.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-anton uppercase tracking-wide text-white bg-gray-900 hover:bg-lime-500 hover:text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/signin" className="text-gray-900 dark:text-lime-400 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
