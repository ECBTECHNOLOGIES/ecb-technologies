"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Route change finished rendering - hide the bar.
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Start the bar as soon as the user clicks an internal link.
  useEffect(() => {
    function handleClick(event) {
      const anchor = event.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const targetUrl = new URL(href, window.location.href);
      if (targetUrl.href === window.location.href) return;

      NProgress.start();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
