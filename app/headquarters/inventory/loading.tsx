import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function InventoryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-white">
      <div className="-ml-6 mt-6 rounded-tl-3xl bg-white p-8 shadow-xl min-h-screen">
        <Skeleton className="h-12 w-96 mb-8" />
        <Skeleton className="h-10 w-full mb-6" />
        <Card className="rounded-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
