"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: ReactNode;
  panel: ReactNode;
}

/** Onglets (Base UI Tabs habillé DS). */
export function Tabs({
  items,
  defaultValue,
  className,
  ...props
}: { items: TabItem[]; className?: string } & Omit<
  ComponentProps<typeof BaseTabs.Root>,
  "children"
>) {
  return (
    <BaseTabs.Root
      defaultValue={defaultValue ?? items[0]?.value}
      className={className}
      {...props}
    >
      <BaseTabs.List className="relative flex gap-1 rounded-[var(--radius)] bg-surface-2 p-1">
        {items.map((it) => (
          <BaseTabs.Tab
            key={it.value}
            value={it.value}
            className={cn(
              "flex-1 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-semibold text-text-dim transition-colors",
              "data-[selected]:bg-primary data-[selected]:text-on-primary",
            )}
          >
            {it.label}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {items.map((it) => (
        <BaseTabs.Panel key={it.value} value={it.value} className="pt-4">
          {it.panel}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
