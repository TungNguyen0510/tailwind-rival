"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import html2canvas from "html2canvas-pro";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import PlaygroundEditor from "@/components/playground/PlaygroundEditor";
import { Button } from "@/components/ui/button";
import PlaygroundContextProvider from "@/context/PlaygroudContextProvider";
import PlaygroundIframe from "@/components/playground/PlaygroundIframe";
import { usePlaygroundContext } from "@/context/PlaygroudContextProvider";
import {
  createChallenge,
  getUserSettings,
  getExistingTargetDays,
} from "@/app/actions";
import { toast } from "sonner";
import { playgroundDefaultHtml } from "@/constants/html";
import { Spinner } from "@/components/ui/spinner";
import { ColorChip } from "@/components/ui/color-chip";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { debounce, extractColorsFromCode } from "@/utils/utils";
import { cn } from "@/lib/utils";

const PlaygroundContent = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [targetDay, setTargetDay] = useState<Date | undefined>(undefined);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const { playground, setPlayground } = usePlaygroundContext();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const result = await getUserSettings();
      if (result.success && result.settings?.is_admin) {
        setIsAdmin(true);
        const targetDaysResult = await getExistingTargetDays();
        if (targetDaysResult.success && targetDaysResult.targetDays) {
          const dates = targetDaysResult.targetDays.map(
            (day) => new Date(day + "T00:00:00")
          );
          setDisabledDates(dates);
        }
      }
    };
    checkAdminStatus();
  }, []);

  const debouncedExtractColors = useMemo(
    () =>
      debounce((code: string) => {
        const extractedColors = extractColorsFromCode(code);
        setColors(extractedColors);
      }, 1000),
    []
  );

  useEffect(() => {
    debouncedExtractColors(playground);
  }, [playground, debouncedExtractColors]);

  const captureIframeImage = async (): Promise<string | null> => {
    if (!iframeRef.current) {
      toast.error("Iframe not found. Please refresh the page.");
      return null;
    }

    // Wait a bit to ensure iframe content is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 200));

    const iframe = iframeRef.current;

    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDocument || !iframeDocument.body) {
      toast.error("Cannot access iframe content. Please try again.");
      return null;
    }

    const canvas = await html2canvas(iframeDocument.body, {
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: iframe.offsetWidth,
      height: iframe.offsetHeight,
      windowWidth: iframeDocument.body.scrollWidth,
      windowHeight: iframeDocument.body.scrollHeight,
    });

    // Convert canvas to base64 data URL
    return canvas.toDataURL("image/png");
  };

  const handleCreateChallenge = async () => {
    setIsCreating(true);

    try {
      const imageBase64 = await captureIframeImage();
      if (!imageBase64) {
        return;
      }

      // Convert playground code to JSON string
      const solutionJson = JSON.stringify({ code: playground });

      const targetDayString = targetDay
        ? format(targetDay, "yyyy-MM-dd")
        : undefined;

      const result = await createChallenge(
        imageBase64,
        solutionJson,
        colors,
        targetDayString
      );

      if (result.success) {
        toast.success("Challenge created successfully!", {
          description: (
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground">
                Thank you for your contribution!
              </p>
            </div>
          ),
        });

        setPlayground(playgroundDefaultHtml);
        localStorage.setItem("playground", playgroundDefaultHtml);
        setColors([]);
        // Add the newly created date to disabled dates
        if (targetDay) {
          setDisabledDates((prev) => [...prev, targetDay]);
        }
        setTargetDay(undefined);
      } else {
        toast.error(result.error || "Failed to create challenge");
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error(
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unexpected error occurred while creating the challenge"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      const imageBase64 = await captureIframeImage();
      if (!imageBase64) {
        return;
      }

      const link = document.createElement("a");
      link.href = imageBase64;
      link.download = "playground.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image!");
    } finally {
      setIsDownloading(false);
      toast.success("Image downloaded successfully!");
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px-40px)] max-h-[calc(100vh-48px-40px)] w-screen">
      <div className="shrink flex-1 flex flex-col border-r max-w-[calc(100vw-865px)] min-w-[432px]">
        <PlaygroundEditor />
      </div>
      <div className="lg:max-w-[865px] min-w-[865px] flex max-h-[calc(100vh-48px-32px)]">
        <div className="flex-1">
          <div className="flex items-center justify-between p-1 px-4 border-b border-r bg-accent">
            <span className="font-medium">Code output</span>
          </div>
          <div className="flex flex-col gap-4 p-4 border-r h-full bg-accent/50">
            <PlaygroundIframe
              ref={iframeRef}
              key="Iframe Preview"
              className="w-[400px] h-[300px]"
            />

            <div className="flex flex-col gap-2 max-w-[400px]">
              <div className="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-card-foreground/10 bg-transparent px-1 py-1 text-base shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring md:text-sm">
                {colors.length === 0 ? (
                  <span className="px-1 text-sm text-muted-foreground text-center w-full">
                    No colors detected yet
                  </span>
                ) : (
                  colors.map((color) => (
                    <ColorChip
                      key={color}
                      color={color}
                      onRemove={() =>
                        setColors(colors.filter((item) => item !== color))
                      }
                    />
                  ))
                )}
              </div>

              {isAdmin && (
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !targetDay && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDay ? (
                        format(targetDay, "PPP")
                      ) : (
                        <span>Select target day</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={targetDay}
                      onSelect={(date) => {
                        setTargetDay(date)
                        setOpenCalendar(false)
                      }}
                      disabled={[{ before: new Date() }, ...disabledDates]}
                      className="w-80"
                    />
                  </PopoverContent>
                </Popover>
              )}

              <Button onClick={handleCreateChallenge} disabled={isCreating}>
                {isCreating ? (
                  <Spinner className="size-4" />
                ) : (
                  "Create challenge"
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownloadImage}
                disabled={isDownloading}
              >
                {isDownloading ? <Spinner className="size-4" /> : "Download"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayGroundPage = () => {
  return (
    <PlaygroundContextProvider>
      <PlaygroundContent />
    </PlaygroundContextProvider>
  );
};

export default PlayGroundPage;
