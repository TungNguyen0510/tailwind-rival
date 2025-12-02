import ChallengeCard from "@/components/ChallengeCard";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

async function Daily() {
  const supabase = await createClient();

  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("*")
    .not("target_day", "is", null)
    .order("target_day", { ascending: false });

  if (error || !challenges) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4 items-center justify-center p-12">
        <h2 className="font-bold text-4xl mb-4">Daily challenges</h2>
        <p className="text-xl text-muted-foreground">
          Daily challenges to improve your skills!
        </p>
      </section>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 container mx-auto">
        {challenges.map((challenge: any) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}

export default Daily;
