import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxStore/store";

type Role = "ADMIN" | "STAFF" | "STUDENT" | "COMPANY";

interface ProtectedRouteProps {
  /** If provided, only these roles may access the nested routes. */
  allowedRoles?: Role[];
}

/**
 * Route guard used inside <Routes>:
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<AppLayout />}>
 *       ...routes any signed-in user can reach
 *     </Route>
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} />}>
 *     ...routes restricted to specific roles
 *   </Route>
 *
 * - No token/user in Redux -> redirect to /signin, remembering where they
 *   were headed so we can send them back after login.
 * - Logged in but role not allowed -> redirect to a "not authorized" page
 *   (falls back to home) instead of silently rendering nothing.
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = Boolean(user && token);

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
