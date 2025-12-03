import { Spinner } from "@/components/ui/spinner";

/**
 * Loading component for Leaderboard page
 * Automatically shown by Next.js while the page data is being fetched
 */
export default function LeaderboardLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <section className="flex flex-col gap-4 items-center justify-center py-8">
        <h2 className="font-bold text-4xl mb-2">Leaderboard</h2>
      </section>

      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner className="w-12 h-12 text-primary" />
        <p className="text-muted-foreground text-lg">Loading leaderboard...</p>
      </div>
    </div>
  );
}
