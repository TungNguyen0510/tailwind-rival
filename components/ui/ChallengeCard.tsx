import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Challenge } from "@/types/challenge";
import Image from "next/image";
import { Chip } from "@/components/ui/chip";
import { formatDateShort } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
  showChip?: boolean;
  /** User's best score for this challenge (0-1200), undefined if not played */
  bestScore?: number;
}

export default function ChallengeCard({
  challenge,
  showChip = true,
  bestScore,
}: ChallengeCardProps) {
  return (
    <Link href={`/play/${challenge.id}`}>
      <Card className="group overflow-hidden hover:scale-105 transition-all duration-300 rounded-[6px]">
        <CardContent className="p-2 relative">
          <Image
            src={challenge.image}
            alt={challenge.id}
            width={400}
            height={300}
            className="object-cover rounded-[6px] aspect-4/3"
          />
          {showChip && (
            <Chip
              className={cn(
                "absolute top-4 right-4 bg-card-foreground text-white dark:text-black",
                "transition-opacity duration-300 group-hover:opacity-0"
              )}
            >
              {formatDateShort(challenge.target_day)}
            </Chip>
          )}
        </CardContent>
        <CardFooter className="px-4 py-1 flex justify-between items-center">
          <div className="flex flex-col items-start">
            <h3 className="text-sm text-card-foreground/50">Your score</h3>
            <p
              className={cn(
                bestScore !== undefined
                  ? "text-yellow-600"
                  : "text-card-foreground/80"
              )}
            >
              {bestScore !== undefined
                ? `${Math.round(bestScore)}`
                : "Not played"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" className="bg-primary hover:scale-105">
              <Play size={24} className="text-white" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
