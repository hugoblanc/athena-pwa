"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSyncExternalStore } from "react";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  emit,
  isArticleSaved,
  removeArticle,
  saveArticle,
  subscribe,
  type SavedArticle,
} from "@/lib/reading-list";

export type BookmarkVariant = "icon" | "feed";

interface BookmarkButtonProps {
  article: Omit<SavedArticle, "savedAt">;
  variant?: BookmarkVariant;
  className?: string;
}

/**
 * Bouton d'ajout/retrait de la liste de lecture.
 *
 * variant="icon"  → IconButton (barre d'actions page article, style ShareButton)
 * variant="feed"  → overlay discret coin sup. droit d'une carte de feed
 */
export function BookmarkButton({
  article,
  variant = "icon",
  className,
}: BookmarkButtonProps) {
  const saved = useSyncExternalStore(
    subscribe,
    () => isArticleSaved(article.id),
    () => false, // snapshot serveur : jamais sauvegardé avant hydratation
  );

  function toggle() {
    if (saved) {
      removeArticle(article.id);
    } else {
      saveArticle({ ...article, savedAt: new Date().toISOString() });
    }
    emit();
  }

  const label = saved ? "Retirer de la liste de lecture" : "Enregistrer pour plus tard";

  if (variant === "feed") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        aria-label={label}
        aria-pressed={saved}
        className={cn(
          "grid size-8 place-items-center rounded-[var(--radius-sm)] border bg-surface/85 backdrop-blur-sm transition-colors duration-150",
          saved
            ? "border-primary/60 text-primary"
            : "border-border/60 text-text-dim hover:text-primary hover:border-primary/60",
          className,
        )}
      >
        {saved ? (
          <BookmarkCheck className="size-4 fill-current" aria-hidden />
        ) : (
          <Bookmark className="size-4" aria-hidden />
        )}
      </button>
    );
  }

  return (
    <IconButton
      aria-label={label}
      aria-pressed={saved}
      onClick={toggle}
      className={cn(
        saved && "border-primary/60 text-primary bg-primary/10",
        className,
      )}
    >
      {saved ? (
        <BookmarkCheck className="fill-current" aria-hidden />
      ) : (
        <Bookmark aria-hidden />
      )}
    </IconButton>
  );
}
