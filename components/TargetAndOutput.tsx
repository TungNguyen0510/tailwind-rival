"use client";

import ImageCompareSlider from "./ImageCompareSlider";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ColorChip } from "./ui/color-chip";
import { User } from "@supabase/supabase-js";
import { Checkbox } from "./ui/checkbox";
import Link from "next/link";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { getUserStats, getGlobalStats } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
    lastScore: number | null;
    highScore: number | null;
  } | null>(null);
  const [globalStats, setGlobalStats] = useState<{
    totalPlayers: number;
    averageSuccessRate: number;
    averageCodeLength: number;
  } | null>(null);

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
        <div className="flex items-center justify-between p-1 px-4 border-b border-r bg-card/50">
          <span className="font-medium">Code output</span>

          <div className="flex gap-2 items-center">
            <Checkbox
              checked={isDiff}
              onCheckedChange={() => setIsDiff(!isDiff)}
            >
              <span className="sr-only">Show diff</span>
            </Checkbox>
            <span className="text-sm">Diff</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 border-r h-full bg-card/50">
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
                    <span className="text-xs text-muted-foreground mb-1">Last Score</span>
                    <span className="text-2xl font-bold">
                      {userStats?.lastScore !== null && userStats?.lastScore !== undefined
                        ? `${userStats.lastScore.toFixed(2)}%`
                        : "—"}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <span className="text-xs text-muted-foreground mb-1">High Score</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {userStats?.highScore !== null && userStats?.highScore !== undefined
                        ? `${userStats.highScore.toFixed(2)}%`
                        : "—"}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="global-stats" className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-3">
                    <span className="text-xs text-muted-foreground mb-1 text-center">Players</span>
                    <span className="text-xl font-bold">
                      {globalStats?.totalPlayers ?? 0}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-3">
                    <span className="text-xs text-muted-foreground mb-1 text-center">Avg Rate</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {globalStats?.averageSuccessRate
                        ? `${globalStats.averageSuccessRate.toFixed(1)}%`
                        : "—"}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-3">
                    <span className="text-xs text-muted-foreground mb-1 text-center">Avg Chars</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {globalStats?.averageCodeLength ?? 0}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between p-1 px-4 border-b bg-card/50">
          <span className="font-medium">Recreate this target</span>
          <span className="font-medium text-sm">400px x 300px</span>
        </div>
        <div className="flex flex-col gap-4 p-4 h-full bg-card/50">
          <Image
            src={publicUrl}
            alt="Image target"
            width={400}
            height={300}
            priority
            className="min-w-[400px] max-w-[400px] min-h-[300px] max-h-[300px]"
          />
          <div className="flex flex-wrap gap-2">
            {colors?.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleCopyColor(color)}
                className="focus:outline-none cursor-pointer transition-transform active:scale-95"
              >
                <ColorChip color={color} />
              </button>
            ))}
          </div>
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
                          src={userCreated?.user_metadata.avatar_url || ""}
                          alt="avatar"
                          width={24}
                          height={24}
                          className="rounded-full size-6 overflow-hidden cursor-pointer"
                        />
                        <AvatarFallback className="text-xs">
                          {userCreated?.user_metadata.full_name
                            ? userCreated?.user_metadata.full_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {userCreated?.user_metadata.full_name || ""}
                      </span>
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
