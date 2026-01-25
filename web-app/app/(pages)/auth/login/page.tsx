import { LoginScreen } from "@/app/features/auth/screens/login-screen";

interface LoginPageProps {
  searchParams: Promise<{
    reset?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return <LoginScreen showResetSuccess={params.reset === "success"} />;
}
