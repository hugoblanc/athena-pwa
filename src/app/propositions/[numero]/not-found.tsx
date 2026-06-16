import { ScrollText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-10">
      <EmptyState
        icon={ScrollText}
        title="Proposition introuvable"
        description="Cette proposition de loi n'existe pas ou n'est plus disponible."
        action={
          <Button render={<Link href="/propositions" />} variant="secondary">
            Retour aux propositions
          </Button>
        }
      />
    </div>
  );
}
