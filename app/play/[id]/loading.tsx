import { Skeleton } from "@/components/ui/skeleton";

export default function PlayLoading() {
  return (
    <div className="flex h-[calc(100vh-48px-40px)] max-h-[calc(100vh-48px-40px)] w-screen overflow-x-auto">
      {/* Left side - Editor skeleton */}
      <div className="shrink flex-1 flex flex-col border-r">
        {/* Editor header */}
        <div className="flex items-center justify-between p-2 px-4 border-b bg-accent">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Editor content */}
        <div className="flex-1 p-4 bg-muted/30">
          <div className="space-y-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: `${Math.random() * 40 + 40}%` }}
              />
            ))}
          </div>
        </div>

        {/* Submit actions skeleton */}
        <div className="flex items-center gap-2 p-2 border-t bg-accent justify-end">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Right side - Target and Output skeleton (2 columns) */}
      <div className="lg:max-w-[865px] min-w-[865px] flex">
        {/* Left column - Code output */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-1 px-4 border-b border-r bg-accent">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex flex-col gap-4 p-4 border-r h-full bg-accent/50">
            {/* Image compare slider skeleton */}
            <Skeleton className="w-[400px] h-[300px] rounded-md" />

            {/* Stats tabs skeleton */}
            <div className="mt-4 space-y-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-24 rounded-md" />
                <Skeleton className="h-24 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Target image */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-1 px-4 border-b bg-accent">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-col gap-4 p-4 h-full bg-accent/50">
            {/* Target image skeleton */}
            <Skeleton className="w-[400px] h-[300px] rounded-md" />

            {/* Colors skeleton */}
            <div className="flex flex-col gap-2 mt-4">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="size-8 rounded-full" />
                ))}
              </div>
            </div>

            {/* Created by skeleton */}
            <div className="flex w-full justify-end mt-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
