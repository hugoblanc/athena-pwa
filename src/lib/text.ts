/**
 * Décodage d'entités HTML dans les chaînes texte (titres WordPress notamment :
 * `l&rsquo;éléphant` → `l'éléphant`). Sans DOM → marche côté serveur ET client.
 * Couvre les entités nommées courantes + toutes les entités numériques
 * (`&#8217;`, `&#x2019;`).
 */

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  sbquo: "‚",
  bdquo: "„",
  laquo: "«",
  raquo: "»",
  euro: "€",
  deg: "°",
  times: "×",
  copy: "©",
  reg: "®",
  trade: "™",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  euml: "ë",
  agrave: "à",
  acirc: "â",
  ccedil: "ç",
  ugrave: "ù",
  ucirc: "û",
  ocirc: "ô",
  icirc: "î",
  iuml: "ï",
  ntilde: "ñ",
  oelig: "œ",
};

function fromCodePoint(code: number): string {
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

/** Décode les entités HTML d'une chaîne. Renvoie la chaîne telle quelle si pas d'entité. */
export function decodeEntities(input: string): string {
  if (!input || input.indexOf("&") === -1) return input;
  return input.replace(
    /&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi,
    (match, body: string) => {
      if (body[0] === "#") {
        const isHex = body[1] === "x" || body[1] === "X";
        const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        return Number.isNaN(code) ? match : fromCodePoint(code) || match;
      }
      const named = NAMED[body.toLowerCase()];
      return named ?? match;
    },
  );
}
