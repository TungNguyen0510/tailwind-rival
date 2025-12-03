"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getMySubmissions } from "@/app/actions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Submission } from "@/types/submission";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import SubmissionCard from "./SubmissionCard";

/**
 * Sheet component that displays user's previous submissions for a challenge.
 * Shows submission history with accuracy scores and timestamps.
 * 
 * @param open - Whether the sheet is open
 * @param onOpenChange - Callback when sheet open state changes
 * @param challengeId - The ID of the challenge to fetch submissions for
 * @param onSelectSubmission - Callback when a submission is selected (loads code into editor)
 */
interface MySolutionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  onSelectSubmission?: (code: string) => void;
}

const MySolutionsSheet = ({
  open,
  onOpenChange,
  challengeId,
  onSelectSubmission,
}: MySolutionsSheetProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSubmissions();
    }
  }, [open, challengeId]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const result = await getMySubmissions(challengeId);

      if (result.success) {
        setSubmissions(result.submissions);
      } else {
        toast.error(result.error || "Failed to fetch submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load your solutions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubmission = (submission: Submission) => {
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
          <SheetTitle>Last Submissions</SheetTitle>
          <SheetDescription>
            Your previous submissions for this challenge. Click to load code into editor.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] my-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <p className="text-muted-foreground text-sm">
                No submissions yet
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Submit your first solution to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-3 mr-4">
              {submissions.map((submission, index) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  isBest={index === 0}
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

export default MySolutionsSheet;
