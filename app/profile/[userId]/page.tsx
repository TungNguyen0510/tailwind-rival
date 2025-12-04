import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import {
  getUserProfileStats,
  getUserSubmissionHistory,
  getUserCompletedChallenges,
} from "@/app/actions/stats";
import { StatsCard } from "@/components/profile/StatsCard";
import { SubmissionHeatmap } from "@/components/profile/SubmissionHeatmap";
import { CompletedChallengesGrid } from "@/components/profile/CompletedChallengesGrid";
import {
  Trophy,
  Flame,
  Goal,
  Ruler,
  Pencil,
  Globe,
  Percent,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getFullUserSettingsInfo } from "@/app/actions/user";
import {
  CodePenIcon,
  LinkedInIcon,
  TwitterIcon,
  GitHubIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  TwitchIcon,
} from "@/components/icons/SocialIcons";

/**
 * Profile Page Component
 * Displays user profile information including:
 * - Avatar and name
 * - Statistics (Global Rank, Completed Challenges, Day Streak)
 * - Submission heatmap for past 6 months
 * - Grid of completed challenges
 */
const ProfilePage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;

  const userInfo = await getFullUserSettingsInfo(userId);

  if (!userInfo) {
    notFound();
  }

  // Get currently logged-in user
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser && currentUser.id === userId;

  // Fetch profile statistics
  const { stats } = await getUserProfileStats(userId);
  const { history } = await getUserSubmissionHistory(userId, 6);
  const { challenges } = await getUserCompletedChallenges(userId);

  return (
    <div className="flex flex-col gap-4 items-center p-6 overflow-x-auto">
      <div className="w-full container mx-auto flex flex-col gap-6">
        <Card className="relative mt-20">
          <div className="absolute top-4 left-4 flex gap-1">
            {userInfo.website && (
              <Link href={userInfo.website} target="_blank">
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <Globe className="size-4" />
                </Badge>
              </Link>
            )}
            {userInfo.twitter && (
              <Link
                href={`https://twitter.com/${userInfo.twitter}`}
                target="_blank"
              >
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <TwitterIcon className="size-4" />
                </Badge>
              </Link>
            )}
            {userInfo.github && (
              <Link
                href={`https://github.com/${userInfo.github}`}
                target="_blank"
              >
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <GitHubIcon className="size-4" />
                </Badge>
              </Link>
            )}
            {userInfo.codepen && (
              <Link
                href={`https://codepen.io/${userInfo.codepen}`}
                target="_blank"
              >
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <CodePenIcon className="size-4" />
                </Badge>
              </Link>
            )}
            {userInfo.linkedin && (
              <Link
                href={`https://linkedin.com/in/${userInfo.linkedin}`}
                target="_blank"
              >
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <LinkedInIcon className="size-4" />
                </Badge>
              </Link>
            )}
            {userInfo.instagram && (
              <Link
                href={`https://instagram.com/${userInfo.instagram}`}
                target="_blank"
              >
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <InstagramIcon className="size-4" />
                </Badge>
              </Link>
            )}
            {userInfo.youtube && (
              <Link
                href={`https://youtube.com/channel/${userInfo.youtube}`}
                target="_blank"
              >
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <YouTubeIcon className="size-4" />
                </Badge>
              </Link>
            )}
            {userInfo.twitch && (
              <Link
                href={`https://twitch.tv/${userInfo.twitch}`}
                target="_blank"
              >
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <TwitchIcon className="size-4" />
                </Badge>
              </Link>
            )}
            {userInfo.facebook && (
              <Link
                href={`https://facebook.com/${userInfo.facebook}`}
                target="_blank"
              >
                <Badge variant="secondary" className="hover:scale-105 p-1">
                  <FacebookIcon className="size-4" />
                </Badge>
              </Link>
            )}
          </div>
          {isOwnProfile && (
            <Link href="/settings">
              <Button className="absolute top-4 right-4">
                <Pencil className="size-4" />
                Edit Profile
              </Button>
            </Link>
          )}
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="rounded-full overflow-hidden border-background shadow-2xl bg-background">
              <Avatar className="size-[120px] border">
                <AvatarImage
                  src={userInfo.avatar_url || undefined}
                  alt="avatar"
                  width={120}
                  height={120}
                  className="rounded-full size-[120px] overflow-hidden object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {(userInfo.display_name &&
                    userInfo.display_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardContent className="pt-20 pb-6">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-2xl font-bold">
                {userInfo.display_name || "Unknown"}
              </h1>

              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <StatsCard
                  value={stats?.globalRank ?? null}
                  label="Global Rank"
                  icon={<Trophy className="size-6 text-yellow-400" />}
                />

                <StatsCard
                  value={stats?.dayStreak ?? 0}
                  label="Day Streak"
                  icon={<Flame className="size-6 text-orange-500" />}
                />
              </div>

              <div className="grid grid-cols-4 gap-4 w-full mt-2">
                <StatsCard
                  value={stats?.completedChallenges ?? 0}
                  label="Completed Challenges"
                  icon={<Goal className="size-6 text-green-500" />}
                />
                <StatsCard
                  value={stats?.totalScore ?? null}
                  label="Total score"
                  icon={<Star className="size-6 text-yellow-500" />}
                />
                <StatsCard
                  value={stats?.avgAccuracy ? `${stats.avgAccuracy}%` : null}
                  label="Avg. match"
                  icon={<Percent className="size-6 text-blue-500" />}
                />
                <StatsCard
                  value={stats?.avgCodeLength ?? null}
                  label="Avg. characters"
                  icon={<Ruler className="size-6 text-purple-500" />}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <SubmissionHeatmap history={history} months={6} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <CompletedChallengesGrid challenges={challenges} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
