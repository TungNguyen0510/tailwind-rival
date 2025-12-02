import { createClient } from "@/utils/supabase/server";

import UserMenu from "./UserMenu";
import LoginDialog from "./LoginDialog";
import { Button } from "../ui/button";

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
