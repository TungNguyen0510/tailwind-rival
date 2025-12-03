"use client";

import { Button } from "@/components/ui/button";
import { usePlayContext } from "@/context/PlayContextProvider";
import { submitChallenge, checkUserHasPerfectScore } from "@/app/actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import MySolutionsSheet from "./MySolutionsSheet";
import TopSolutionsSheet from "./TopSolutionsSheet";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Component that handles challenge submission with image comparison.
 * Captures the PlayIframe output from the UI, compares with target image, and saves submission.
 *
 * @param challengeId - The ID of the current challenge
 * @param targetImageUrl - The URL of the target image to compare against
 * @param isAuthenticated - Whether user is logged in
 */
const SubmitActions = ({
  challengeId,
  targetImageUrl,
  isAuthenticated = false,
}: {
  challengeId: string;
  targetImageUrl: string;
  isAuthenticated?: boolean;
}) => {
  const { play, setPlay } = usePlayContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMySolutionsOpen, setIsMySolutionsOpen] = useState(false);
  const [isTopSolutionsOpen, setIsTopSolutionsOpen] = useState(false);
  const [hasPerfectScore, setHasPerfectScore] = useState(false);
  const [isCheckingPerfectScore, setIsCheckingPerfectScore] = useState(true);

  useEffect(() => {
    checkPerfectScore();
  }, [challengeId]);

  const checkPerfectScore = async () => {
    setIsCheckingPerfectScore(true);
    try {
      const result = await checkUserHasPerfectScore(challengeId);
      if (result.success) {
        setHasPerfectScore(result.hasPerfectScore);
      }
    } catch (error) {
      console.error("Error checking perfect score:", error);
    } finally {
      setIsCheckingPerfectScore(false);
    }
  };

  /**
   * Captures the PlayIframe that's already rendered in the UI.
   * Finds the iframe by title and captures its content as base64 image.
   */
  const captureIframeAsImage = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const iframe = document.querySelector(
        'iframe[title="Iframe Preview"]'
      ) as HTMLIFrameElement;

      if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
        reject(new Error("PlayIframe not found or not loaded"));
        return;
      }

      try {
        // Wait a bit to ensure any recent changes are rendered
        setTimeout(async () => {
          try {
            const iframeBody = iframe.contentDocument!.body;

            const canvas = await html2canvas(iframeBody, {
              width: 400,
              height: 300,
              backgroundColor: "#ffffff",
              scale: 1,
              logging: false,
              useCORS: true,
              allowTaint: true,
            });

            const imageBase64 = canvas.toDataURL("image/png");
            resolve(imageBase64);
          } catch (error) {
            reject(error);
          }
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      toast.info("Capturing your output...");
      const outputImage = await captureIframeAsImage();

      toast.info("Comparing with target...");
      const result = await submitChallenge(
        challengeId,
        play,
        outputImage,
        targetImageUrl
      );

      if (result.success) {
        toast.success(
          `🎉 Submitted! Accuracy: ${result.accuracy}% | Score: ${result.score} | ${result.codeLength} chars`,
          { duration: 5000 }
        );

        // Recheck perfect score after successful submission
        if (result.accuracy === 100) {
          setHasPerfectScore(true);
        }

        // Dispatch event to refresh stats
        window.dispatchEvent(new CustomEvent("submissionSuccess"));
      } else {
        toast.error(result.error || "Submission failed");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit challenge"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadSubmission = (code: string) => {
    setPlay(code);
    localStorage.setItem(`play-${challengeId}`, code);
  };

  return (
    <>
      <MySolutionsSheet
        open={isMySolutionsOpen}
        onOpenChange={setIsMySolutionsOpen}
        challengeId={challengeId}
        onSelectSubmission={handleLoadSubmission}
      />

      <TopSolutionsSheet
        open={isTopSolutionsOpen}
        onOpenChange={setIsTopSolutionsOpen}
        challengeId={challengeId}
        onSelectSubmission={handleLoadSubmission}
      />

      <div className="flex flex-wrap items-center justify-end gap-2 p-2 bg-accent/50">
        {/* My Solutions Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="secondary"
                  disabled={isSubmitting || !isAuthenticated}
                  onClick={() => setIsMySolutionsOpen(true)}
                  className="gap-2"
                >
                  {!isAuthenticated && <Lock className="h-4 w-4" />}
                  My Solutions
                </Button>
              </span>
            </TooltipTrigger>
            {!isAuthenticated && (
              <TooltipContent>
                <p>Please login to view your solutions</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Top Solutions Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="secondary"
                  disabled={
                    isSubmitting ||
                    !hasPerfectScore ||
                    isCheckingPerfectScore ||
                    !isAuthenticated
                  }
                  onClick={() => setIsTopSolutionsOpen(true)}
                  className="gap-2"
                >
                  {(!hasPerfectScore || !isAuthenticated) && (
                    <Lock className="h-4 w-4" />
                  )}
                  Top Solutions
                </Button>
              </span>
            </TooltipTrigger>
            {!isAuthenticated ? (
              <TooltipContent>
                <p>
                  Please login and achieve 100% accuracy to unlock Top Solutions
                </p>
              </TooltipContent>
            ) : !hasPerfectScore ? (
              <TooltipContent>
                <p>Achieve 100% accuracy to unlock Top Solutions</p>
              </TooltipContent>
            ) : null}
          </Tooltip>
        </TooltipProvider>

        {/* Submit Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isAuthenticated}
                  className="gap-2"
                >
                  {!isAuthenticated && <Lock className="h-4 w-4" />}
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </span>
            </TooltipTrigger>
            {!isAuthenticated && (
              <TooltipContent>
                <p>Please login to submit your solution</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default SubmitActions;
