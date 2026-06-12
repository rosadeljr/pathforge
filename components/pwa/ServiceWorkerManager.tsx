"use client";

/**
 * ServiceWorkerManager — registers /sw.js (production only) and keeps the app
 * seamlessly up to date:
 *  - On a new deploy, when the fresh worker is installed and waiting, we show
 *    a single "New version ready" toast with a refresh action.
 *  - Accepting posts SKIP_WAITING; on controllerchange we reload once.
 * Renders nothing.
 */

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export function ServiceWorkerManager() {
  const reloaded = useRef(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;

    function promptUpdate(waiting: ServiceWorker) {
      toast(
        (t) => (
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13 }}>A new version of PathForge is ready.</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                waiting.postMessage({ type: "SKIP_WAITING" });
              }}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                background: "linear-gradient(180deg,#fcd34d,#f59e0b)",
                color: "#1a1303",
                whiteSpace: "nowrap",
              }}
            >
              Refresh
            </button>
          </span>
        ),
        { duration: 12000, id: "pf-sw-update" }
      );
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        // a worker is already waiting from a previous visit
        if (reg.waiting && navigator.serviceWorker.controller) promptUpdate(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const incoming = reg.installing;
          if (!incoming) return;
          incoming.addEventListener("statechange", () => {
            if (incoming.state === "installed" && navigator.serviceWorker.controller) {
              promptUpdate(incoming);
            }
          });
        });
      })
      .catch(() => {
        /* SW is an enhancement — never break the app over it */
      });

    // Only reload on a *takeover* (an updated worker replacing an old one).
    // On the very first visit clients.claim() flips the controller from null
    // to the new worker — reloading then would wipe in-progress state (e.g. a
    // half-typed signup form) for every new visitor.
    const hadController = !!navigator.serviceWorker.controller;
    const onControllerChange = () => {
      if (!hadController || reloaded.current) return;
      reloaded.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      void registration;
    };
  }, []);

  return null;
}
