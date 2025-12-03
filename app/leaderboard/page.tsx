import {
  getGlobalLeaderboard,
  getStreakLeaderboard,
  getBatchUserDisplayInfo,
  getUserRankAndScore,
} from "@/app/actions";
import { getUserProfileStats } from "@/app/actions/stats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

/**
 * Leaderboard Page
 * Displays top 100 players ranked by total score or streak.
 * Features a podium-style display for top 3 and card rows for the rest.
 */
export default async function Leaderboard() {
  // Get current user
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Fetch leaderboards
  const { leaderboard: scoreLeaderboard } = await getGlobalLeaderboard(100);
  const { leaderboard: streakLeaderboard } = await getStreakLeaderboard(100);

  // Fetch user display info for all users
  const allUserIds = Array.from(
    new Set([
      ...scoreLeaderboard.map((e) => e.userId),
      ...streakLeaderboard.map((e) => e.userId),
    ])
  );
  const userInfoMap = await getBatchUserDisplayInfo(allUserIds);

  // Check if current user is in top 100 (score)
  let currentUserScoreRank: {
    rank: number | null;
    totalScore: number;
  } | null = null;
  if (currentUser) {
    const isInScoreTop100 = scoreLeaderboard.some(
      (e) => e.userId === currentUser.id
    );
    if (!isInScoreTop100) {
      currentUserScoreRank = await getUserRankAndScore(currentUser.id);
    }
  }

  // Check if current user is in top 100 (streak)
  let currentUserStreakRank: {
    rank: number | null;
    streak: number;
  } | null = null;
  if (currentUser) {
    const isInStreakTop100 = streakLeaderboard.some(
      (e) => e.userId === currentUser.id
    );
    if (!isInStreakTop100) {
      const { stats } = await getUserProfileStats(currentUser.id);
      if (stats) {
        // Calculate user's streak rank
        const allStreaks = streakLeaderboard.map((e) => e.streak);
        const userStreak = stats.dayStreak;
        const rank =
          allStreaks.filter((s) => s > userStreak).length + streakLeaderboard.length + 1;
        currentUserStreakRank = { rank, streak: userStreak };
      }
    }
  }

  // Get current user info
  const currentUserInfo = currentUser
    ? userInfoMap.get(currentUser.id) || {
      displayName:
        currentUser.user_metadata?.full_name ||
        currentUser.email?.split("@")[0] ||
        "You",
      avatarUrl: currentUser.user_metadata?.avatar_url || "",
    }
    : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <section className="flex flex-col gap-4 items-center justify-center py-8">
        <h2 className="font-bold text-4xl mb-2">Leaderboard</h2>
      </section>

      <Tabs defaultValue="score" className="w-full">
        <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="score">Score</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
        </TabsList>

        {/* Score Tab */}
        <TabsContent value="score">
          {scoreLeaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No submissions yet. Be the first to play!
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <TopThreePodium
                entries={scoreLeaderboard.slice(0, 3)}
                userInfoMap={userInfoMap}
                type="score"
              />

              {/* Rest of leaderboard (4-100) */}
              <div className="flex flex-col gap-2 mt-8 max-w-2xl mx-auto">
                {scoreLeaderboard.slice(3).map((entry) => (
                  <LeaderboardCard
                    key={entry.userId}
                    entry={entry}
                    userInfo={userInfoMap.get(entry.userId)}
                    type="score"
                  />
                ))}

                {/* Current user if not in top 100 */}
                {currentUserScoreRank &&
                  currentUserScoreRank.rank &&
                  currentUserInfo && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                      <LeaderboardCard
                        entry={{
                          rank: currentUserScoreRank.rank,
                          odUserId: currentUser!.id,
                          totalScore: currentUserScoreRank.totalScore,
                          challengeCount: 0,
                        }}
                        userInfo={currentUserInfo}
                        type="score"
                        isCurrentUser
                      />
                    </div>
                  )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Streak Tab */}
        <TabsContent value="streak">
          {streakLeaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No submissions yet. Be the first to play!
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <TopThreePodium
                entries={streakLeaderboard.slice(0, 3)}
                userInfoMap={userInfoMap}
                type="streak"
              />

              {/* Rest of leaderboard (4-100) */}
              <div className="flex flex-col gap-2 mt-8 max-w-2xl mx-auto">
                {streakLeaderboard.slice(3).map((entry) => (
                  <LeaderboardCard
                    key={entry.userId}
                    entry={entry}
                    userInfo={userInfoMap.get(entry.userId)}
                    type="streak"
                  />
                ))}

                {/* Current user if not in top 100 */}
                {currentUserStreakRank &&
                  currentUserStreakRank.rank &&
                  currentUserInfo && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                      <LeaderboardCard
                        entry={{
                          rank: currentUserStreakRank.rank,
                          odUserId: currentUser!.id,
                          streak: currentUserStreakRank.streak,
                        }}
                        userInfo={currentUserInfo}
                        type="streak"
                        isCurrentUser
                      />
                    </div>
                  )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Top 3 Podium Component
 * Displays top 3 players in a podium style with #1 in center
 * Handles cases with 1, 2, or 3+ players
 */
function TopThreePodium({
  entries,
  userInfoMap,
  type,
}: {
  entries: any[];
  userInfoMap: Map<string, any>;
  type: "score" | "streak";
}) {
  if (entries.length === 0) return null;

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  const PodiumCard = ({
    entry,
    position,
  }: {
    entry: any;
    position: 1 | 2 | 3;
  }) => {
    const userInfo = userInfoMap.get(entry.userId);
    const displayName = userInfo?.displayName || "Anonymous";
    const avatarUrl = userInfo?.avatarUrl || "";
    const initials = displayName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const podiumColors = {
      1: "from-yellow-500 to-yellow-600",
      2: "from-gray-400 to-gray-500",
      3: "from-amber-600 to-amber-700",
    };

    const podiumHeights = {
      1: "h-20",
      2: "h-14",
      3: "h-10",
    };

    const value =
      type === "score"
        ? `${entry.totalScore?.toLocaleString() || 0} points`
        : `${entry.streak || 0} days`;

    const subValue =
      type === "score" ? `(${entry.challengeCount || 0} challenges)` : "";

    return (
      <div className="flex flex-col items-center">
        <Link
          href={`/profile/${entry.userId}`}
          className="flex flex-col items-center hover:opacity-80 transition-opacity"
        >
          <Avatar
            className={`border-2 ${position === 1 ? "size-20" : "size-16"} mb-2`}
          >
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className={position === 1 ? "text-xl" : "text-lg"}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm mb-1">{displayName}</span>
        </Link>

        <span className="text-xs text-muted-foreground mb-1">{value}</span>
        {subValue && (
          <span className="text-xs text-muted-foreground/70">{subValue}</span>
        )}

        {/* Podium base */}
        <div
          className={`w-28 ${podiumHeights[position]} bg-linear-to-b ${podiumColors[position]} rounded-t-lg mt-4 flex items-center justify-center`}
        >
          <span className="text-white font-bold text-xl">#{position}</span>
        </div>
      </div>
    );
  };

  // Handle different number of entries
  if (entries.length === 1) {
    // Only 1 user - show centered with placeholders on both sides
    return (
      <div className="flex justify-center items-end gap-4 mb-8">
        <div className="w-28" /> {/* Left placeholder */}
        <PodiumCard entry={first} position={1} />
        <div className="w-28" /> {/* Right placeholder */}
      </div>
    );
  }

  if (entries.length === 2) {
    // Only 2 users - #2 left, #1 center, placeholder right
    return (
      <div className="flex justify-center items-end gap-4 mb-8">
        <PodiumCard entry={second} position={2} />
        <PodiumCard entry={first} position={1} />
        <div className="w-28" /> {/* Right placeholder to keep #1 centered */}
      </div>
    );
  }

  // 3 users - #2 left, #1 center, #3 right
  return (
    <div className="flex justify-center items-end gap-4 mb-8">
      <PodiumCard entry={second} position={2} />
      <PodiumCard entry={first} position={1} />
      <PodiumCard entry={third} position={3} />
    </div>
  );
}

/**
 * Leaderboard Card Component
 * Displays a single leaderboard entry in card format
 */
function LeaderboardCard({
  entry,
  userInfo,
  type,
  isCurrentUser = false,
}: {
  entry: any;
  userInfo: any;
  type: "score" | "streak";
  isCurrentUser?: boolean;
}) {
  const displayName = userInfo?.displayName || "Anonymous";
  const avatarUrl = userInfo?.avatarUrl || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const value =
    type === "score"
      ? `${entry.totalScore?.toLocaleString() || 0} points`
      : `${entry.streak || 0} days`;

  const subValue =
    type === "score" && entry.challengeCount
      ? `(${entry.challengeCount} challenges)`
      : "";

  return (
    <Card className={isCurrentUser ? "border-primary bg-primary/5" : ""}>
      <CardContent className="flex items-center gap-4 p-4">
        <span className="w-10 text-center font-bold text-muted-foreground">
          #{entry.rank}
        </span>

        <Link
          href={`/profile/${entry.userId || entry.odUserId}`}
          className="flex items-center gap-3 flex-1 hover:underline"
        >
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{displayName}</span>
        </Link>

        <div className="text-right">
          <span className="font-bold">{value}</span>
          {subValue && (
            <span className="text-sm text-muted-foreground ml-2">
              {subValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
