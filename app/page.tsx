import LoginDialog from "@/components/auth/LoginDialog";
import ChallengeCarousel from "@/components/ui/ChallengeCarousel";
import RecordTicker from "@/components/ui/RecordTicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { getUserBestScores, getRecentRecords } from "@/app/actions/submission";
import { getLocalDateString } from "@/utils/utils";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = getLocalDateString();
  // Get latest 6 challenges up to today, then reverse to show oldest first (left to right)
  const { data: challengesDesc } = await supabase
    .from("challenges")
    .select("*")
    .lte("target_day", today)
    .order("target_day", { ascending: false })
    .limit(6);

  // Reverse to display oldest -> newest (left to right in carousel)
  const challenges = challengesDesc?.reverse() || [];

  // Fetch user's best scores for each challenge
  const challengeIds = challenges.map((c) => c.id);
  const { scores } = await getUserBestScores(challengeIds);

  // Convert Map to plain object for client component
  const scoresObject: Record<string, number> = {};
  scores.forEach((value, key) => {
    scoresObject[key] = value;
  });

  // Fetch recent records for ticker
  const { records } = await getRecentRecords(30);

  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        {!user && (
          <section className="flex flex-col gap-4 items-center justify-center p-12">
            <h2 className="font-bold text-4xl mb-2">
              Welcome to Tailwind Rival!
            </h2>
            <p className="text-lg text-muted-foreground">
              Replicate the target layouts using TailwindCSS - the more accurate
              your attempt, the higher your score!
            </p>
            <LoginDialog>
              <Button variant={"default"} size="lg">
                <span>Get Started</span>
              </Button>
            </LoginDialog>
          </section>
        )}

        <div className="flex flex-col gap-4 p-12 container mx-auto">
          <div className="flex gap-4 items-center justify-between">
            <div>
              <h2 className="font-bold text-2xl">Daily challenges</h2>
              <p className="text-muted-foreground/70">
                Daily challenges to improve your skills!
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/daily">View all daily challenges</Link>
            </Button>
          </div>

          <Card className="bg-background">
            <CardContent className="p-6">
              <ChallengeCarousel
                challenges={challenges}
                today={today}
                userScores={scoresObject}
              />
            </CardContent>
          </Card>

          {/* Recent Records Ticker */}
          {records && records.length > 0 && <RecordTicker records={records} />}
        </div>
      </main>
    </>
  );
}
