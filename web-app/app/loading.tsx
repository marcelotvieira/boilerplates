import { Spinner } from '@/components/ui/spinner';

export default function GlobalLoading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}
