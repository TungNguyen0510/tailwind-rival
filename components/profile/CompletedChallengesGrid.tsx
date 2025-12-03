/**
 * Completed Challenges Grid Component
 * Displays a grid of challenge images that the user has completed (100% accuracy).
 * Shows challenge thumbnails in a responsive grid layout.
 */

import { Challenge } from "@/types/challenge";
import Image from "next/image";
import Link from "next/link";

interface CompletedChallengesGridProps {
  challenges: Challenge[];
}

export const CompletedChallengesGrid = ({
  challenges,
}: CompletedChallengesGridProps) => {
  if (challenges.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Completed challenges</h2>
        <div className="text-muted-foreground text-sm">
          No challenges completed yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Completed challenges</h2>
      <div className="flex gap-2 flex-wrap">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            href={`/play/${challenge.id}`}
            className="group"
          >
            <div className="aspect-4/3 overflow-hidden transition-colors hover:scale-105">
              <Image
                src={challenge.image}
                alt="Challenge"
                width={80}
                height={60}
                className="object-cover transition-transform aspect-4/3"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
