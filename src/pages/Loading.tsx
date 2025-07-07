import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Logo/Icon Skeleton */}
            <div className="flex justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>

            {/* Content Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Footer Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
