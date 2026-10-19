import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import JobDescriptionPage from "./pages/OtherPage/JobdescriptionPage";
import ReportPage from "./pages/OtherPage/ReportPage";
import StudentProjects from "./pages/OtherPage/StudentProjects";
import StudentApplications from "./pages/OtherPage/StudentApplications";
import StudentResume from "./pages/OtherPage/StudentResume";
import StudentCertifications from "./pages/OtherPage/StudentCertifications";
import CompanyApplications from "./pages/OtherPage/CompanyApplications";
import CompanyJobPost from "./pages/OtherPage/CompanyJobPost";
import ForgetPasswordForm from "./components/auth/ForgetPasswordForm";
import CompanyListPage from "./pages/Tables/CompanyList";
import StaffListPage from "./pages/Tables/StaffList";
import StudentListPage from "./pages/Tables/StudentList";
import JobsPage from "./pages/OtherPage/JobsPage";
import ProfilePage from "./pages/ProfilePages/UserProfile";
import UserInfoCard from "./components/UserProfile/UserInfoCard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  // Auth state now lives entirely in redux-persist (see reduxStore/store.ts) —
  // it rehydrates before <PersistGate> renders <App />, so no manual
  // localStorage read/write is needed here anymore.

  return (
    <section className="app-bg bg-no-repeat bg-cover bg-center">
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Layout — public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ForgetPasswordForm />} />

          {/* Any signed-in user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/job/:id" element={<JobDescriptionPage />} />
              <Route path="/job-page" element={<JobsPage />} />
              <Route path="/project" element={<StudentProjects />} />
              <Route path="/resume" element={<StudentResume />} />
              <Route path="/application" element={<StudentApplications />} />
              <Route path="/certificate" element={<StudentCertifications />} />
              <Route path="/jobpost" element={<CompanyJobPost />} />
              <Route path="/company-apply" element={<CompanyApplications />} />
              <Route path="/userinfo" element={<UserInfoCard />} />
            </Route>
          </Route>

          {/* Admin / Staff only — adjust the role list to match your actual policy */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/staff-list" element={<StaffListPage />} />
              <Route path="/student-list" element={<StudentListPage />} />
              <Route path="/company-list" element={<CompanyListPage />} />
              <Route path="/report" element={<ReportPage />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </section>
  );
}
