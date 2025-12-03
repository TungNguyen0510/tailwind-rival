"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getTopSubmissions } from "@/app/actions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SubmissionWithUser } from "@/types/submission";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import SubmissionCard from "./SubmissionCard";

/**
 * Sheet component that displays top submissions from all users for a challenge.
 * Shows the best submission from each user with their avatar and name.
 * 
 * @param open - Whether the sheet is open
 * @param onOpenChange - Callback when sheet open state changes
 * @param challengeId - The ID of the challenge to fetch submissions for
 * @param onSelectSubmission - Callback when a submission is selected (loads code into editor)
 */
interface TopSolutionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  onSelectSubmission?: (code: string) => void;
}

const TopSolutionsSheet = ({
  open,
  onOpenChange,
  challengeId,
  onSelectSubmission,
}: TopSolutionsSheetProps) => {
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTopSubmissions();
    }
  }, [open, challengeId]);

  const fetchTopSubmissions = async () => {
    setIsLoading(true);
    try {
      const result = await getTopSubmissions(challengeId);

      if (result.success) {
        setSubmissions(result.submissions as SubmissionWithUser[]);
      } else {
        toast.error(result.error || "Failed to fetch top submissions");
      }
    } catch (error) {
      console.error("Error fetching top submissions:", error);
      toast.error("Failed to load top solutions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubmission = (submission: SubmissionWithUser) => {
    if (onSelectSubmission) {
      onSelectSubmission(submission.code);
      toast.success("Code loaded into editor");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Top Solutions</SheetTitle>
          <SheetDescription>
            Best submissions from the community. Click Load Code to try them out.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <p className="text-muted-foreground text-sm">
                No submissions yet
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Be the first to submit a solution!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission, index) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  isBest={index === 0}
                  showUserInfo={true}
                  loadCode={() => handleSelectSubmission(submission)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default TopSolutionsSheet;
