import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminAuthClient } from "@/utils/supabase/admin";
import { notFound } from "next/navigation";

const ProfilePage = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;

  const { data, error } = await adminAuthClient.getUserById(userId);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4 items-center p-6">
      <div className="xl:w-2/5 xl:max-w-4xl flex flex-col gap-4">
        <div className="relative h-64 rounded-lg border mt-32">
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full overflow-hidden border shadow-2xl">
              <Avatar className="size-[120px]">
                <AvatarImage
                  src={data.user.user_metadata.avatar_url}
                  alt="avatar"
                  width={120}
                  height={120}
                  className="rounded-full size-[120px] overflow-hidden object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {data.user.user_metadata.full_name
                    ? data.user.user_metadata.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 mt-18">
            <h1 className="text-2xl font-bold">
              {data.user.user_metadata.full_name}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
