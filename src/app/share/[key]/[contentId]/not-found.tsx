import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Contenu partagé inconnu (404 média/contenu) : retour au fil d'actu. */
export default function ShareNotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:px-8 lg:pt-8">
      <EmptyState
        icon={SearchX}
        title="Contenu introuvable"
        description="Ce contenu partagé n'est plus disponible ou le lien est incorrect."
        action={
          <Button render={<Link href="/" />}>Retour au fil d&apos;actu</Button>
        }
      />
    </div>
  );
}
