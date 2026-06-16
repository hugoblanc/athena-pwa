import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/tag";

/** Libellé FR pour un provider Firebase / serveur. */
function providerLabel(provider?: string | null): string {
  if (!provider) return "Email";
  const p = provider.toLowerCase();
  if (p.includes("google")) return "Google";
  if (p.includes("password") || p.includes("email")) return "Email";
  return provider;
}

export interface ProfileIdentity {
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  provider?: string | null;
}

/** Carte identité : avatar + nom + email + badge provider. */
export function ProfileCard({ identity }: { identity: ProfileIdentity }) {
  const name = identity.displayName?.trim() || identity.email || "Compte Athena";
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-elev-1">
      <Avatar src={identity.photoUrl} name={name} size={56} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[18px] font-extrabold tracking-[-0.01em]">
          {name}
        </p>
        {identity.email && (
          <p className="truncate text-sm text-text-dim">{identity.email}</p>
        )}
        <div className="mt-2">
          <Tag>{providerLabel(identity.provider)}</Tag>
        </div>
      </div>
    </div>
  );
}
