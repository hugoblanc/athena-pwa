import DOMPurify from "isomorphic-dompurify";

/**
 * Nettoie du HTML de contenu (articles) avant `dangerouslySetInnerHTML`.
 * À exécuter côté serveur (Server Component / route handler).
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "b", "i", "u", "a", "ul", "ol", "li",
      "blockquote", "h2", "h3", "h4", "figure", "figcaption", "img",
      "iframe", "pre", "code", "hr", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "width", "height", "allowfullscreen", "frameborder"],
    ALLOWED_URI_REGEXP: /^(https?:|mailto:|\/)/i,
  });
}
