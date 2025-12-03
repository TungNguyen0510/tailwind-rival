import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Challenge } from "@/types/challenge";
import Image from "next/image";
import { Chip } from "./ui/chip";
import { formatDateShort } from "@/utils/utils";
import { Button } from "./ui/button";
import { Play } from "lucide-react";
import Link from "next/link";

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <Link href={`/play/${challenge.id}`}>
      <Card className="overflow-hidden hover:scale-105 transition-all duration-300">
        <CardContent className="p-2 relative">
          <Image src={challenge.image} alt={challenge.id} width={400} height={300} className="object-cover rounded-md aspect-4/3" />
          <Chip className="absolute top-4 right-4 bg-card-foreground text-white dark:text-black">{formatDateShort(challenge.target_day)}</Chip>
        </CardContent>
        <CardFooter className="px-3 py-1 flex justify-between items-center">
          <div className="flex flex-col items-start">
            <h3 className="text-sm text-card-foreground/50">Your score</h3>
            <p className="text-card-foreground">Not played</p>
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
