import { Skeleton } from "@/components/ui/skeleton"

export default function TaxServiceConfigurationLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 rounded-lg border p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}
