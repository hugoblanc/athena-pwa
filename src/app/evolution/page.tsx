import { existsSync } from "node:fs";
import { join } from "node:path";
import { ArrowRight, Bell, Headphones, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InstallGuide } from "@/components/static/install-guide";
import { MigrationAudio } from "@/components/static/migration-audio";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Athena entre dans une nouvelle ère",
  description:
    "Un mot personnel sur l'évolution d'Athena : pourquoi l'application quitte les stores pour une version web installable, et pourquoi vous n'y perdez rien.",
  openGraph: {
    title: "Athena entre dans une nouvelle ère",
    description:
      "Pourquoi Athena quitte les stores pour une version web installable. Un mot de Hugo.",
    type: "article",
  },
};

/** Détection serveur des médias optionnels (déposés dans public/evolution/). */
const PUBLIC = join(process.cwd(), "public", "evolution");
function publicExists(file: string): boolean {
  try {
    return existsSync(join(PUBLIC, file));
  } catch {
    return false;
  }
}

export default function EvolutionPage() {
  // Illustration hero (de préférence) ou portrait, si déposée dans public/evolution/.
  const heroImg = ["hero.png", "hero.jpg", "hero.webp", "portrait.jpg"].find(
    publicExists,
  );
  const audioFile = ["message.mp3", "message.m4a", "message.ogg"].find(
    publicExists,
  );

  return (
    <div className="mx-auto max-w-[680px] px-5 pb-16 pt-6 lg:px-8 lg:pt-10">
      {/* ── Hero ────────────────────────────────────────────── */}
      <header className="mb-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-primary">
          Athena évolue
        </p>

        <h1 className="mt-4 font-display text-[28px] font-extrabold leading-[1.12] tracking-[-0.02em] lg:text-[34px]">
          Athena entre dans une nouvelle ère
        </h1>

        {heroImg && (
          <div className="mt-6 overflow-hidden rounded-[var(--radius)] border border-border bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/evolution/${heroImg}`}
              alt="Athena entre dans une nouvelle ère"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        )}
      </header>

      {audioFile && (
        <MigrationAudio
          src={`/evolution/${audioFile}`}
          label="Le mot de Hugo"
        />
      )}

      {/* ── La lettre ───────────────────────────────────────── */}
      <article
        className={[
          // Titre et corps partagent la même couleur (text) et la même
          // famille ; on ne différencie que par la taille et la graisse, pour
          // une lecture uniforme et reposante.
          "text-[16.5px] leading-[1.75] text-text/90 lg:text-[17px]",
          "[&_p]:my-4",
          "[&_h2]:mt-9 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-[19px] [&_h2]:font-bold [&_h2]:tracking-[-0.01em] [&_h2]:text-text",
          "[&_strong]:font-semibold [&_strong]:text-text",
        ].join(" ")}
      >
        <p>Bonjour,</p>
        <p>
          Si vous lisez ça, c&apos;est que vous utilisez Athena sur votre
          téléphone. Alors merci. Cette appli n&apos;existerait pas sans vous, et
          je tenais à vous expliquer moi-même, simplement, où on va.
        </p>

        <h2>Reprendre un peu de liberté</h2>
        <p>
          Pour mettre une appli sur votre téléphone, il faut passer par les
          magasins d&apos;Apple et de Google. Ce sont eux qui décident, qui
          valident, qui prennent leur commission. Pour un projet indépendant
          comme Athena, qui rassemble des médias libres, ça finissait par
          coincer. <strong>J&apos;avais envie de m&apos;en affranchir.</strong>
        </p>

        <h2>Aujourd&apos;hui, le web suffit</h2>
        <p>
          Pendant longtemps, un site web faisait déjà beaucoup. Mais pour
          certaines choses, comme recevoir des notifications, une appli installée
          sur le téléphone restait plus pratique. C&apos;est pour ça
          qu&apos;Athena en était une. Aujourd&apos;hui, ce détour n&apos;est
          plus nécessaire : un site peut{" "}
          <strong>s&apos;ajouter à votre écran d&apos;accueil comme une vraie
          appli</strong>, envoyer des notifications, lire un podcast en
          arrière-plan, et continuer à marcher même quand le réseau faiblit.
        </p>

        <h2>Une seule version d&apos;Athena</h2>
        <p>
          Jusqu&apos;ici je faisais tourner trois versions en même temps :
          Android, iPhone et le site. Seul, bénévolement, sur mon temps libre.
          C&apos;était devenu ingérable, et ça freinait le reste. En ne gardant
          qu&apos;une seule version web, je peux enfin{" "}
          <strong>remettre vraiment de l&apos;énergie dans Athena</strong>, et
          m&apos;occuper de le faire grandir plutôt que de le rafistoler.
        </p>

        <h2>Ce qui change pour vous</h2>
        <p>
          La version que vous avez là est la{" "}
          <strong>dernière que je mettrai sur les stores</strong>. Ensuite, tout
          se passe sur le site, que vous pourrez installer comme une appli. Vous
          n&apos;y perdez rien. C&apos;est même là que les prochaines nouveautés
          vont arriver.
        </p>
      </article>

      {/* ── Rappel : toujours gratuit ───────────────────────── */}
      <div className="mt-8 rounded-[var(--radius)] border border-primary/30 bg-primary/10 px-4 py-3.5 text-[15.5px] leading-relaxed text-text">
        Et ça reste{" "}
        <strong className="font-semibold">100&nbsp;% gratuit</strong>. Sans pub,
        sans traçage, sans revente de vos données. Comme avant, en mieux.
      </div>

      {/* ── Ce que vous gardez ──────────────────────────────── */}
      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Headphones,
            title: "L'écoute audio",
            body: "Articles lus et podcasts, en arrière-plan.",
          },
          {
            icon: Bell,
            title: "Les notifications",
            body: "Les alertes des médias que vous suivez.",
          },
          {
            icon: Sparkles,
            title: "Et bien plus",
            body: "Les nouveautés ne sortiront plus que là.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-[var(--radius)] border border-border bg-surface p-4"
          >
            <Icon className="size-5 text-primary" />
            <p className="mt-2.5 text-[14px] font-bold text-text">{title}</p>
            <p className="mt-1 text-[13px] leading-snug text-text-dim">{body}</p>
          </div>
        ))}
      </section>

      {/* ── Installation ────────────────────────────────────── */}
      <section className="mt-10 rounded-[var(--radius)] border border-border bg-surface-2 p-5 lg:p-6">
        <h2 className="font-display text-[20px] font-extrabold tracking-[-0.01em]">
          Installer Athena, en 30 secondes
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text-dim">
          Vous gardez la même icône, vos identifiants, l&apos;audio et les
          notifications. Et tout ce qui arrivera ensuite.
        </p>

        <div className="mt-4">
          <InstallGuide />
        </div>

        <Button
          className="mt-5 w-full sm:w-auto"
          nativeButton={false}
          render={
            <Link href="/">
              Ouvrir Athena maintenant
              <ArrowRight className="size-4" />
            </Link>
          }
        />
      </section>

      <div className="mt-10 flex items-center gap-3.5 border-t border-border pt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/evolution/hugo.jpg"
          alt="Hugo Blanc"
          className="size-12 shrink-0 rounded-full border border-border object-cover"
        />
        <div>
          <p className="font-display text-[16px] font-bold text-text">
            Hugo Blanc
          </p>
          <p className="text-[13px] leading-snug text-text-dim">
            Je développe Athena seul, bénévolement.
          </p>
        </div>
      </div>
    </div>
  );
}
