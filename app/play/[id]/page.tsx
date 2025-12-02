import PlayEditor from "@/components/PlayEditor";
import TargetAndOutput from "@/components/TargetAndOutput";
import { Button } from "@/components/ui/button";
import PlayContextProvider from "@/context/PlayContextProvider";
import { adminAuthClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const PlayPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const supabase = await createClient();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", id)
    .single();

  const { data: userCreated } = await adminAuthClient.getUserById(
    challenge.user_created
  );

  if (!challenge) {
    notFound();
  }

  return (
    <PlayContextProvider id={id}>
      <div className="flex h-[calc(100vh-48px-40px)] max-h-[calc(100vh-48px-40px)] w-screen overflow-x-auto">
        <div className="shrink flex-1 flex flex-col border-r">
          <PlayEditor id={id} />
          <div className="flex flex-wrap items-center gap-2 p-2 bg-card">
            <Button variant="secondary">My Submisstions</Button>
            <Button variant="secondary">Top Solutions</Button>
            <Button>Submit</Button>
          </div>
        </div>
        <TargetAndOutput
          publicUrl={challenge?.image}
          colors={challenge?.colors}
          userCreated={userCreated?.user as User}
        />
      </div>
    </PlayContextProvider>
  );
};

export default PlayPage;
