"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Interrupteur on/off (Base UI Switch habillé). */
export function Switch({
  className,
  ...props
}: ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      className={cn(
        "relative h-[27px] w-[46px] rounded-full border border-border bg-surface-2 transition-colors duration-200 data-[checked]:border-primary data-[checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className="absolute top-0.5 left-0.5 size-[21px] rounded-full bg-text-faint transition-[left,background] duration-200 data-[checked]:left-[21px] data-[checked]:bg-white" />
    </BaseSwitch.Root>
  );
}
