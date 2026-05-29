"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const GA_ID = "G-L8MK82ZMPY";

export default function GAClient() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // @ts-expect-error assume gtag is defined globally
    if (!window.gtag) return;

    // Send a page_view on route change
    // @ts-expect-error assume gtag is defined globally
    window.gtag("config", GA_ID, {
      page_path: window.location.pathname,
    });
  }, [pathname]);

  return null;
}
