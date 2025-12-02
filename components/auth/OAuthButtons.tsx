import { Button } from "../ui/button";
import Image from "next/image";
import { signInWithOAuth } from "@/app/actions";

function OAuthButtons() {
  return (
    <form className="flex flex-col gap-4">
      <Button
        variant="outline"
        className="flex gap-4"
        formAction={async () => await signInWithOAuth("github")}
      >
        <Image
          src={"/icons/github.svg"}
          alt="Github"
          width={20}
          height={20}
          className="dark:invert"
        />
        <span>
          <span className="font-thin">Continue with</span> Github
        </span>
      </Button>
      <Button
        variant="outline"
        className="flex gap-4"
        formAction={async () => await signInWithOAuth("google")}
      >
        <Image src={"/icons/google.svg"} alt="Google" width={20} height={20} />
        <span>
          <span className="font-thin">Continue with</span> Google
        </span>
      </Button>
    </form>
  );
}

export default OAuthButtons;
