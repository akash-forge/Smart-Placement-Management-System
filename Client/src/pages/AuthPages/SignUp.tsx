import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="PLACEMENT CELL"
        description="This is React.js Placement Cell project coordinates the details and data in the college."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
