"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Slider (Base UI habillé) — utilisé pour le scrubber audio, le volume, etc. */
export function Slider({
  className,
  ...props
}: ComponentProps<typeof BaseSlider.Root>) {
  return (
    <BaseSlider.Root className={cn("w-full", className)} {...props}>
      <BaseSlider.Control className="flex h-4 w-full items-center">
        <BaseSlider.Track className="h-[6px] w-full rounded-[3px] bg-surface-2">
          <BaseSlider.Indicator className="rounded-[3px] bg-primary" />
          <BaseSlider.Thumb className="size-4 rounded-full border-2 border-primary bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
