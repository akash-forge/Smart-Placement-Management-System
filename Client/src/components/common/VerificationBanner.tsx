import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../reduxStore/store";
import { updateVerificationStatus } from "../../reduxStore/authSlice";
import apiClient from "../../api/client";

/**
 * Shown app-wide (mounted in AppLayout, not just the dashboard) so a
 * pending/rejected account is reminded on every page, not just the one it
 * happens to land on first. ADMIN has no verificationStatus (it's always
 * VERIFIED server-side), so this renders nothing for that role.
 *
 * verificationStatus is captured in Redux once, at login — if an admin
 * approves the account later in the same browser session, that snapshot
 * never updates on its own and the banner (and anything gated on it, like
 * the Post Job button) stays stuck showing "pending" even after approval.
 * This refetches the real status on mount and whenever the tab regains
 * focus, so approval shows up without forcing a logout/login.
 */
export default function VerificationBanner() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user || !user.id || !user.role || user.role === "ADMIN") return;

    const refreshStatus = async () => {
      try {
        const res = await apiClient.get(`/profile/${user.id}?role=${user.role}`);
        if (res.data?.verificationStatus) {
          dispatch(updateVerificationStatus(res.data.verificationStatus));
        }
      } catch {
        // Silent — this is a background refresh, not a user-facing action.
        // If it fails, the banner just keeps showing the last known status.
      }
    };

    refreshStatus();
    window.addEventListener("focus", refreshStatus);
    return () => window.removeEventListener("focus", refreshStatus);
  }, [user?.id, user?.role, dispatch]);

  if (!user || !user.verificationStatus || user.verificationStatus === "VERIFIED") {
    return null;
  }

  const isRejected = user.verificationStatus === "REJECTED";

  return (
    <div
      className={`mb-4 border px-4 py-3 text-sm flex items-start gap-3 ${
        isRejected
          ? "border-red-600 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300 dark:border-red-700"
          : "border-gray-900 bg-gray-900 text-white dark:border-lime-500 dark:bg-gray-900 dark:text-lime-300"
      }`}
    >
      <span className={`mt-0.5 w-2 h-2 shrink-0 ${isRejected ? "bg-red-600" : "bg-lime-500"}`} />
      <div>
        <p className="font-semibold uppercase tracking-wide text-xs">
          {isRejected ? "Verification rejected" : "Account pending verification"}
        </p>
        <p className="mt-0.5 opacity-90">
          {isRejected
            ? "Your account was not approved. Contact the placement cell for details."
            : user.role === "COMPANY"
            ? "An admin needs to verify your company before you can post jobs."
            : user.role === "STAFF"
            ? "An admin needs to verify your account before you can manage students."
            : "A staff member needs to verify your account before you can apply to jobs."}
        </p>
      </div>
    </div>
  );
}
