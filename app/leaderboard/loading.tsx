import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading component for Leaderboard page
 * Automatically shown by Next.js while the page data is being fetched
 * Shows skeleton UI matching the actual leaderboard layout
 */
export default function LeaderboardLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <section className="flex flex-col gap-4 items-center justify-center py-8">
        <h2 className="font-bold text-4xl mb-2">Leaderboard</h2>
      </section>

      {/* Tabs skeleton */}
      <div className="w-full max-w-xs mx-auto mb-8">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Top 3 Podium skeleton */}
      <div className="flex justify-center items-end gap-1 mb-8">
        {/* Second place */}
        <div className="flex flex-col items-center">
          <Skeleton className="size-16 rounded-full mb-2" />
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-3 w-16 mb-4" />
          <Skeleton className="w-48 h-20 rounded-t-lg" />
        </div>

        {/* First place */}
        <div className="flex flex-col items-center">
          <Skeleton className="size-20 rounded-full mb-2" />
          <Skeleton className="h-4 w-28 mb-1" />
          <Skeleton className="h-3 w-24 mb-1" />
          <Skeleton className="h-3 w-20 mb-4" />
          <Skeleton className="w-48 h-32 rounded-t-lg" />
        </div>

        {/* Third place */}
        <div className="flex flex-col items-center">
          <Skeleton className="size-16 rounded-full mb-2" />
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-3 w-16 mb-4" />
          <Skeleton className="w-48 h-12 rounded-t-lg" />
        </div>
      </div>

      {/* Leaderboard cards skeleton (ranks 4-10) */}
      <div className="flex flex-col gap-2 mt-8 max-w-3xl mx-auto">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="w-10 h-6" />
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
