import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading component for Profile page
 * Automatically shown by Next.js while the page data is being fetched
 */
export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-4 items-center p-6 overflow-x-auto">
      <div className="w-full container mx-auto flex flex-col gap-6">
        <Card className="relative mt-20">
          {/* Avatar skeleton */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <Skeleton className="size-[120px] rounded-full" />
          </div>

          <CardContent className="pt-20 pb-6">
            <div className="flex flex-col items-center gap-4">
              {/* Name skeleton */}
              <Skeleton className="h-8 w-48" />

              {/* Stats skeleton */}
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>

              <div className="grid grid-cols-4 gap-4 w-full mt-2">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap skeleton */}
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>

        {/* Challenges skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8 gap-4">
              <Spinner className="w-8 h-8 text-primary" />
              <span className="text-muted-foreground">Loading profile...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
