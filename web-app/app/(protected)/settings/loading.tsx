import { Spinner } from '@/components/ui/spinner';

export default function Loading () {
  return (
    <div className="!w-full min-h-64 h-full flex items-center justify-center">
      <Spinner className="animate-spin" />
    </div>
  )
}
