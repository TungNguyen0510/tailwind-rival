import { createClient } from "@/utils/supabase/server";

import UserMenu from "@/components/auth/UserMenu";
import LoginDialog from "@/components/auth/LoginDialog";
import { Button } from "@/components/ui/button";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? <UserMenu user={user} /> : <LoginDialog>
    <Button variant="default">
      <span>Log in</span>
    </Button>
  </LoginDialog>;
}
