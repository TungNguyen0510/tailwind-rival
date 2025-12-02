"use client";

import ImageCompareSlider from "./ImageCompareSlider";
import Image from "next/image";
import { useState } from "react";
import { ColorChip } from "./ui/color-chip";
import { User } from "@supabase/supabase-js";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import Link from "next/link";
import { toast } from "sonner";

const TargetAndOutput = ({
  publicUrl,
  colors,
  userCreated,
}: {
  publicUrl: string;
  colors: string[];
  userCreated: User;
}) => {
  const [isDiff, setIsDiff] = useState(false);

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      toast.success(`Copied ${color} to clipboard!`);
    } catch (error) {
      console.error("Failed to copy color:", error);
      toast.error("Failed to copy color to clipboard!");
    }
  };
  return (
    <div className="lg:max-w-[865px] min-w-[865px] flex max-h-[calc(100vh-48px-32px-40px)]">
      <div className="flex-1">
        <div className="flex items-center justify-between p-1 px-4 border-b border-r bg-card">
          <span className="font-medium">Code output</span>

          {/* <div className="flex gap-2 items-center">
            <Checkbox
              checked={isDiff}
              onCheckedChange={() => setIsDiff(!isDiff)}
            >
              <span className="sr-only">Show diff</span>
            </Checkbox>
            <span className="text-sm">Diff</span>
          </div> */}
        </div>
        <div className="flex flex-col gap-4 p-4 border-r h-full bg-card">
          <ImageCompareSlider isDiff={isDiff} publicUrl={publicUrl} />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between p-1 px-4 border-b bg-card">
          <span className="font-medium">Recreate this target</span>
          <span className="font-medium text-sm">400px x 300px</span>
        </div>
        <div className="flex flex-col gap-4 p-4 h-full bg-card">
          <Image
            src={publicUrl}
            alt="Image target"
            width={400}
            height={300}
            priority
            className="min-w-[400px] max-w-[400px] min-h-[300px] max-h-[300px]"
          />
          <div className="flex flex-wrap gap-2">
            {colors?.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleCopyColor(color)}
                className="focus:outline-none cursor-pointer transition-transform active:scale-95"
              >
                <ColorChip color={color} />
              </button>
            ))}
          </div>
          {userCreated && (
            <div className="flex w-full justify-end">
              <div className="flex items-center gap-2 text-sm">
                Created by{" "}
                <Link
                  href={`/profile/${userCreated?.id}`}
                  className="flex items-center gap-2 bg-card rounded-full border border-black/10 dark:border-white/10 p-1.5 cursor-pointer"
                >
                  <Image
                    src={userCreated?.user_metadata.avatar_url || ""}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full size-6 overflow-hidden cursor-pointer"
                  />
                  <span className="text-sm">
                    {userCreated?.user_metadata.full_name || ""}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetAndOutput;
