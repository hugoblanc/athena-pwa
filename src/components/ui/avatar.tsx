import { cn } from "@/lib/cn";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Avatar image + fallback initiales sur dégradé.
 * `ringColor` = liseré optionnel (ex. couleur de groupe politique).
 */
export function Avatar({
  src,
  name,
  size = 40,
  ringColor,
  square = false,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  ringColor?: string;
  square?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-[#6ea8ff] to-[#9b6bff] font-bold text-white",
        square ? "rounded-[10px]" : "rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : undefined,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
