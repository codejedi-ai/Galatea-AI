import { LoadingSpinner } from "@/components/loading-spinner"

export default function SignInLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="medium" />
    </div>
  )
}
