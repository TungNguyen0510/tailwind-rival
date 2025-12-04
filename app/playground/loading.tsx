import { Skeleton } from "@/components/ui/skeleton";

export default function PlaygroundLoading() {
  return (
    <div className="flex h-[calc(100vh-48px-40px)] max-h-[calc(100vh-48px-40px)] w-screen">
      {/* Editor pane */}
      <div className="shrink flex-1 flex flex-col border-r max-w-[calc(100vw-433px)] min-w-[432px]">
        <div className="flex items-center justify-between p-2 px-4 border-b bg-accent/60">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex-1 p-4 bg-muted/30">
          <div className="space-y-2">
            {Array.from({ length: 18 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: `${Math.random() * 45 + 40}%` }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 border-t bg-accent/60 justify-end">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Preview / Controls pane */}
      <div className="lg:max-w-[433px] min-w-[433px] flex max-h-[calc(100vh-48px-32px)]">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-1 px-4 border-b border-r bg-accent">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex flex-col gap-4 p-4 border-r h-full bg-accent/50">
            {/* Iframe preview */}
            <Skeleton className="w-[400px] h-[300px] rounded-md" />

            {/* Colors input form */}
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 flex-1 min-w-[120px]" />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
