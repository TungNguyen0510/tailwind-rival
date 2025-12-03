import ChallengeCard from "@/components/ChallengeCard";
import { getUserBestScores } from "@/app/actions/submission";
import { createClient } from "@/utils/supabase/server";
import { getLocalDateString } from "@/utils/utils";
import { notFound } from "next/navigation";

async function Daily() {
  const supabase = await createClient();
  const today = getLocalDateString();

  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("*")
    .not("target_day", "is", null)
    .lte("target_day", today) // Only show challenges up to today
    .order("target_day", { ascending: false });

  if (error || !challenges) {
    notFound();
  }

  // Fetch user's best scores for each challenge
  const challengeIds = challenges.map((c) => c.id);
  const { scores } = await getUserBestScores(challengeIds);

  // Convert Map to plain object
  const userScores: Record<string, number> = {};
  scores.forEach((value, key) => {
    userScores[key] = value;
  });

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4 items-center justify-center p-12">
        <h2 className="font-bold text-4xl mb-4">Daily challenges</h2>
        <p className="text-xl text-muted-foreground">
          Daily challenges to improve your skills!
        </p>
      </section>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 container mx-auto">
        {challenges.map((challenge: any) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            bestScore={userScores[challenge.id]}
          />
        ))}
      </div>
    </div>
  );
}

export default Daily;
