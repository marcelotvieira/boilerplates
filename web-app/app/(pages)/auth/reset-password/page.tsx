import { redirect } from "next/navigation";
import { ResetPasswordScreen } from "@/app/features/auth/screens/reset-password-screen";

interface ResetPasswordPageProps {
  searchParams: {
    email?: string
  }
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  // Se não tem email no query param, redireciona para forgot-password
  if (!searchParams.email) {
    redirect("/auth/forgot-password");
  }

  return <ResetPasswordScreen email={searchParams.email} />;
}
