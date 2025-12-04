import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function DailyLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <section className="flex flex-col gap-4 items-center justify-center p-12">
        <h2 className="font-bold text-4xl mb-4">Daily challenges</h2>
        <p className="text-xl text-muted-foreground">
          Daily challenges to improve your skills!
        </p>
      </section>

      {/* Challenge Cards Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 container mx-auto">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-2">
              {/* Image skeleton */}
              <Skeleton className="aspect-4/3 rounded-md" />
            </CardContent>
            <CardFooter className="p-3 flex flex-col gap-2">
              {/* Date chip skeleton */}
              <Skeleton className="h-5 w-20" />
              {/* Score skeleton */}
              <Skeleton className="h-4 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
