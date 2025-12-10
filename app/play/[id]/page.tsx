import PlayEditor from "@/components/play/PlayEditor";
import TargetAndOutput from "@/components/play/TargetAndOutput";
import SubmitActions from "@/components/play/SubmitActions";
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

  if (!challenge) {
    notFound();
  }

  const { data: userCreated } = await adminAuthClient.getUserById(
    challenge.user_created
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <PlayContextProvider id={id}>
      <div className="flex h-[calc(100vh-48px-40px)] max-h-[calc(100vh-48px-40px)] w-screen overflow-x-auto">
        <div className="shrink flex-1 flex flex-col border-r">
          <PlayEditor id={id} />
          <SubmitActions
            challengeId={id}
            targetImageUrl={challenge?.image}
            isAuthenticated={isAuthenticated}
          />
        </div>
        <TargetAndOutput
          publicUrl={challenge?.image}
          colors={challenge?.colors}
          userCreated={userCreated?.user as User}
          challengeId={id}
        />
      </div>
    </PlayContextProvider>
  );
};

export default PlayPage;
