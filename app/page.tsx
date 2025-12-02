import LoginDialog from "@/components/auth/LoginDialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        {user ? (
          <section className="flex flex-col gap-4 items-center justify-center p-12">
            <h2 className="font-bold text-4xl mb-4">Welcome back to Tailwind Rival!</h2>
            <p className="text-xl text-muted-foreground">
              Continue replicating layouts and improve your skills!
            </p>
          </section>
        ) : (
          <section className="flex flex-col gap-4 items-center justify-center p-12">
            <h2 className="font-bold text-4xl mb-4">Welcome to Tailwind Rival!</h2>
            <p className="text-xl text-muted-foreground">
              Replicate the target layouts using TailwindCSS - the more accurate your attempt, the higher your score!
            </p>
            <LoginDialog>
              <Button variant={"default"} size="lg">
                <span>Get Started</span>
              </Button>
            </LoginDialog>
          </section>
        )}
      </main>
    </>
  );
}
