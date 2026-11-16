"use client";

import { useEffect } from "react";

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    // Only execute on client and when serviceWorker is supported
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const unregisterOldWorkers = async () => {
      try {
        // Enforce a strict 500ms timeout guard:
        // In Safari Private Browsing mode, WebKit often hangs promises for storage APIs.
        // Promise.race ensures we never block or delay execution.
        const timeout = new Promise<ServiceWorkerRegistration[]>((resolve) =>
          setTimeout(() => resolve([]), 500)
        );

        const getRegistrations = navigator.serviceWorker.getRegistrations();
        const registrations = await Promise.race([getRegistrations, timeout]);

        if (Array.isArray(registrations)) {
          for (const reg of registrations) {
            reg.unregister().catch(() => {});
          }
        }
      } catch {
        // Silently ignore in private browsing or restricted environments
      }
    };

    // Run when the browser is idle to ensure zero impact on First Contentful Paint
    if ("requestIdleCallback" in window) {
      const handle = (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(unregisterOldWorkers);
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as Window & { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(unregisterOldWorkers, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}
