"use client";

import ImageCompareSlider from "@/components/play/ImageCompareSlider";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ColorChip } from "@/components/ui/color-chip";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  getUserStats,
  getGlobalStats,
  getUserDisplayInfo,
} from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { UserDisplayInfo } from "@/types/user-settings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Percent, Ruler, Star, Users, Zap } from "lucide-react";

const TargetAndOutput = ({
  publicUrl,
  colors,
  userCreated,
  challengeId,
}: {
  publicUrl: string;
  colors: string[];
  userCreated: User;
  challengeId: string;
}) => {
  const [isDiff, setIsDiff] = useState(false);
  const [userStats, setUserStats] = useState<{
    last: { accuracy: number; score: number; codeLength: number } | null;
    best: { accuracy: number; score: number; codeLength: number } | null;
  } | null>(null);
  const [globalStats, setGlobalStats] = useState<{
    totalPlayers: number;
    averageSuccessRate: number;
    averageCodeLength: number;
    averageScore: number;
  } | null>(null);

  // State for user display info (prioritizes user_settings)
  const [creatorInfo, setCreatorInfo] = useState<UserDisplayInfo>({
    userId: userCreated.id,
    avatarUrl: userCreated.user_metadata?.avatar_url || null,
    displayName: userCreated.user_metadata?.full_name || "User",
  });

  // Fetch creator display info
  useEffect(() => {
    getUserDisplayInfo(userCreated.id).then(setCreatorInfo);
  }, [userCreated.id]);

  useEffect(() => {
    fetchStats();

    const handleSubmissionSuccess = () => {
      fetchStats();
    };

    window.addEventListener("submissionSuccess", handleSubmissionSuccess);

    return () => {
      window.removeEventListener("submissionSuccess", handleSubmissionSuccess);
    };
  }, [challengeId]);

  const fetchStats = async () => {
    const [userResult, globalResult] = await Promise.all([
      getUserStats(challengeId),
      getGlobalStats(challengeId),
    ]);

    if (userResult.success && userResult.stats) {
      setUserStats(userResult.stats);
    }

    if (globalResult.success && globalResult.stats) {
      setGlobalStats(globalResult.stats);
    }
  };

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      toast.success(`Copied ${color} to clipboard!`);
    } catch (error) {
      console.error("Failed to copy color:", error);
      toast.error("Failed to copy color to clipboard!");
    }
  };
  return (
    <div className="lg:max-w-[865px] min-w-[865px] flex max-h-[calc(100vh-48px-32px-40px)]">
      <div className="flex-1">
        <div className="flex items-center justify-between p-1 px-4 border-b border-r bg-accent">
          <span className="font-medium">Code output</span>

          <div className="flex items-center gap-2">
            {/* <div className="flex items-center gap-2">
              <Switch
                checked={isSlideAndCompare}
                onCheckedChange={() => setIsSlideAndCompare(!isSlideAndCompare)}
                aria-label="Slide & Compare"
              />
              <span className="text-sm">Slide & Compare</span>
            </div> */}

            <div className="flex items-center gap-2">
              <Switch
                checked={isDiff}
                onCheckedChange={() => setIsDiff(!isDiff)}
                aria-label="Show diff"
              />
              <span className="text-sm">Show diff</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 border-r h-full bg-accent/50">
          <ImageCompareSlider isDiff={isDiff} publicUrl={publicUrl} />

          <Tabs defaultValue="your-stats" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="your-stats">Your Stats</TabsTrigger>
              <TabsTrigger value="global-stats">Global Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="your-stats" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Star className="size-4 text-yellow-500 mb-2" />
                    {userStats?.last ? (
                      <div className="flex items-center gap-1 text-lg">
                        <span className="font-bold">{userStats.last.score.toFixed(0)}</span> <span className="text-sm text-muted-foreground">&#123;{userStats.last.codeLength}&#125;</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">—</span>
                    )}
                    <span className="text-sm text-muted-foreground/50 mb-1">
                      Last Score
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Zap className="size-4 text-yellow-500 mb-2" />
                    {userStats?.best ? (
                      <div className="flex items-center gap-1 text-lg">
                        <span className="font-bold">{userStats.best.score.toFixed(0)}</span> <span className="text-sm text-muted-foreground">&#123;{userStats.best.codeLength}&#125;</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">—</span>
                    )}
                    <span className="text-sm text-muted-foreground/50 mb-1">
                      Best Score
                    </span>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="global-stats" className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Card>
                  <CardContent className="flex items-center gap-4 p-3">
                    <div className="flex items-center justify-center p-2 border rounded-full bg-muted">
                      <Users className="size-6 text-zinc-600" />
                    </div>

                    <div className="flex flex-col items-start justify-center">
                      <span className="text-sm text-muted-foreground/50 mb-1 text-center">
                        Players
                      </span>
                      <span className="text-lg font-bold text-yellow-600">
                        {globalStats?.totalPlayers ?? 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-3">
                    <div className="flex items-center justify-center p-2 border rounded-full bg-muted">
                      <Percent className="size-6 text-blue-600" />
                    </div>

                    <div className="flex flex-col items-start justify-center">
                      <span className="text-sm text-muted-foreground/50 mb-1 text-center">
                        Success rate
                      </span>
                      <span className="text-lg font-bold text-yellow-600">
                        {globalStats?.averageSuccessRate
                          ? `${globalStats.averageSuccessRate.toFixed(1)}%`
                          : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-3">
                    <div className="flex items-center justify-center p-2 border rounded-full bg-muted">
                      <Star className="size-6 text-yellow-500" />
                    </div>

                    <div className="flex flex-col items-start justify-center">
                      <span className="text-sm text-muted-foreground/50 mb-1 text-center">
                        Avg. score
                      </span>
                      <span className="text-lg font-bold text-yellow-600">
                        {globalStats?.averageScore ?? 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-3">
                    <div className="flex items-center justify-center p-2 border rounded-full bg-muted">
                      <Ruler className="size-6 text-purple-500" />
                    </div>

                    <div className="flex flex-col items-start justify-center">
                      <span className="text-sm text-muted-foreground/50 mb-1 text-center">
                        Avg. chars
                      </span>
                      <span className="text-lg font-bold text-yellow-600">
                        {globalStats?.averageCodeLength ?? 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between p-1 px-4 border-b bg-accent">
          <span className="font-medium">Recreate this target</span>
          <span className="font-medium text-sm">400px x 300px</span>
        </div>
        <div className="flex flex-col gap-4 p-4 h-full bg-accent/50">
          <Image
            src={publicUrl}
            alt="Image target"
            width={400}
            height={300}
            priority
            className="min-w-[400px] max-w-[400px] min-h-[300px] max-h-[300px]"
          />
          {colors.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/50/50 text-sm">
                  Colors
                </span>
                <Separator orientation="horizontal" className="flex-1 w-full" />
              </div>
              <div className="flex flex-wrap gap-2">
                {colors?.map((color) => (
                  <TooltipProvider key={color}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleCopyColor(color)}
                          className="focus:outline-none cursor-pointer transition-transform active:scale-95"
                        >
                          <ColorChip color={color} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        Click to copy
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
          {userCreated && (
            <div className="flex w-full justify-end">
              <div className="flex items-center gap-2 text-sm">
                Created by{" "}
                <Link
                  href={`/profile/${userCreated?.id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Card>
                    <CardContent className="flex items-center gap-2 p-2">
                      <Avatar className="size-6">
                        <AvatarImage
                          src={creatorInfo.avatarUrl || ""}
                          alt="avatar"
                          width={24}
                          height={24}
                          className="rounded-full size-6 overflow-hidden cursor-pointer"
                        />
                        <AvatarFallback className="text-sm">
                          {creatorInfo.displayName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{creatorInfo.displayName}</span>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetAndOutput;
