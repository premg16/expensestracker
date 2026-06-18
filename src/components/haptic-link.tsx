"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type HapticLinkProps = ComponentProps<typeof Link>;

export function HapticLink({ onClick, ...props }: HapticLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(8);
        }

        onClick?.(event);
      }}
    />
  );
}
