import { LoginScreen } from '@/app/features/auth/screens/login-screen'

interface LoginPageProps {
  searchParams: {
    reset?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginScreen showResetSuccess={searchParams.reset === 'success'} />
}
