"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import PlaygroundEditor from "@/components/playground/PlaygroundEditor";
import { Button } from "@/components/ui/button";
import PlaygroundContextProvider from "@/context/PlaygroudContextProvider";
import PlaygroundIframe from "@/components/playground/PlaygroundIframe";
import { usePlaygroundContext } from "@/context/PlaygroudContextProvider";
import { createChallenge } from "@/app/actions";
import { toast } from "sonner";
import { playgroundDefaultHtml } from "@/constants/html";
import { Spinner } from "@/components/ui/spinner";
import { ColorChip } from "@/components/ui/color-chip";
import { extractColorsFromCode } from "@/utils/utils";

const PlaygroundContent = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const { playground, setPlayground } = usePlaygroundContext();

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

      const result = await createChallenge(imageBase64, solutionJson, colors);

      if (result.success) {
        toast.success("Challenge created successfully!");

        setPlayground(playgroundDefaultHtml);
        localStorage.setItem("playground", playgroundDefaultHtml);
        setColors([]);
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

  const handleFilterColors = () => {
    const extractedColors = extractColorsFromCode(playground);
    setColors(extractedColors);
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
              <Button variant="secondary" onClick={handleFilterColors}>
                Filter color
              </Button>

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
