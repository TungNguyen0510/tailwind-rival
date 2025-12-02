"use client";

import { Submission, SubmissionWithUser } from "@/types/submission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MonacoEditor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Card component that displays a single submission with its details.
 * Can show user avatar and name for Top Solutions (when showUserInfo is true).
 * 
 * @param submission - The submission data to display (can include user info)
 * @param isBest - Whether this is the best submission (highest accuracy)
 * @param showUserInfo - Whether to show user avatar and name (for Top Solutions)
 * @param loadCode - Callback when "Load Code" button is clicked
 */
interface SubmissionCardProps {
  submission: Submission | SubmissionWithUser;
  isBest?: boolean;
  showUserInfo?: boolean;
  loadCode: () => void;
}

const SubmissionCard = ({ submission, isBest, showUserInfo, loadCode }: SubmissionCardProps) => {
  const { theme } = useTheme();
  const router = useRouter();

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "bg-green-500";
    if (accuracy >= 80) return "bg-blue-500";
    if (accuracy >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(submission.code);
      toast.success("Code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy code to clipboard");
    }
  };

  const handleLoadCode = () => {
    loadCode();
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showUserInfo && submission.user_id) {
      router.push(`/profile/${submission.user_id}`);
    }
  };

  const submissionWithUser = submission as SubmissionWithUser;
  const userAvatarUrl = submissionWithUser.user_avatar_url;
  const userFullName = submissionWithUser.user_full_name || "Anonymous";
  const userInitial = userFullName.charAt(0).toUpperCase();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="submission" className="border rounded-lg">
        <div className="p-4">
          {showUserInfo && (
            <div className="flex items-center gap-2 mb-3 pb-3">
              <Avatar
                className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={handleAvatarClick}
              >
                <AvatarImage src={userAvatarUrl} alt={userFullName} />
                <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
              </Avatar>
              <span
                className="text-sm font-medium cursor-pointer hover:underline"
                onClick={handleAvatarClick}
              >
                {userFullName}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={submission.accuracy === 100 ? "default" : "secondary"}
                  className={getAccuracyColor(submission.accuracy)}
                >
                  {submission.accuracy.toFixed(2)}%
                </Badge>
                {isBest && (
                  <Badge variant="outline" className="text-xs bg-yellow-200 text-yellow-600" title="Best: Highest accuracy + Shortest code">
                    ⭐ Best
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {submission.code.length} chars
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground group relative">
                <span>
                  {formatDistanceToNow(new Date(submission.created_at), {
                    addSuffix: true,
                  })}
                </span>
                <span className="absolute left-0 top-0 w-full bg-background rounded text-xs text-muted-foreground shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  {new Date(submission.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <AccordionTrigger className="hover:no-underline py-1">
            <span className="text-sm font-medium">View Code</span>
          </AccordionTrigger>
        </div>

        <AccordionContent className="px-4 pb-4">
          <div className="border rounded-md overflow-hidden mb-2">
            <MonacoEditor
              value={submission.code}
              theme={theme === "dark" ? "vs-dark" : "light"}
              language="html"
              height="200px"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 12,
                wordWrap: "on",
                lineNumbers: "on",
                folding: true,
                renderLineHighlight: "none",
                scrollbar: {
                  vertical: "auto",
                  horizontal: "auto",
                },
              }}
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              onClick={handleLoadCode}
              size="sm"
              variant="default"
              className="hover:scale-105 transition-all duration-300"
            >
              Load Code
            </Button>
            <Button
              onClick={handleCopyCode}
              size="sm"
              variant="outline"
              className="hover:scale-105 transition-all duration-300"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SubmissionCard;
