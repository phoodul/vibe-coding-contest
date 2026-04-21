"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "./track";
import { pathToFeature } from "./feature-map";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname === lastTracked.current) return;
    lastTracked.current = pathname;
    const feature = pathToFeature(pathname);
    void track(feature, "open");
  }, [pathname]);

  return null;
}
