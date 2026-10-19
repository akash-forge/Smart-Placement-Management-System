import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ForgetPasswordForm from "../../components/auth/ForgetPasswordForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="PLACEMENT CELL"
        description="This is React.js Placement Cell project coordinates the details and data in the college."
      />
      <AuthLayout>
        <ForgetPasswordForm />
      </AuthLayout>
    </>
  );
}