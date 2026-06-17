/**
 * Normalise l'URL du logo d'un média.
 *
 * Les logos en base ont des formes hétérogènes héritées de l'ancien webapp :
 *  - relatives `assets/x.jpg` → résolues contre la page courante (cassées) ;
 *  - `https://athena-app.xyz/assets/x.jpg` → l'ancien Angular les servait, la
 *    PWA non ;
 *  - `https://www.athena-app.fr/x.png` → toujours servies, OK telles quelles.
 *
 * On rapatrie les deux premières vers `/assets/<fichier>` (servi par la PWA,
 * cf. `public/assets/`), et on laisse les URLs absolues qui fonctionnent.
 */
export function mediaLogoSrc(logo?: string | null): string | undefined {
  if (!logo) return undefined;
  const trimmed = logo.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    const inAssets = trimmed.match(/\/assets\/([^/?#]+)$/i);
    return inAssets ? `/assets/${inAssets[1]}` : trimmed;
  }

  // Chemin relatif : on ne garde que le nom de fichier et on sert depuis /assets.
  const file = trimmed.replace(/^\/+/, "").replace(/^assets\//i, "");
  return `/assets/${file}`;
}
