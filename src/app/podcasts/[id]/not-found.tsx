import { Music } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function PodcastNotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-10">
      <EmptyState
        icon={Music}
        title="Ce podcast n'existe pas ou a été retiré"
        action={
          <Button render={<Link href="/podcasts" />}>
            Retour aux podcasts
          </Button>
        }
      />
    </div>
  );
}
