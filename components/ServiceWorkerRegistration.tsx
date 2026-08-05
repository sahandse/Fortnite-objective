"use client";
import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setSupported(false);
      return;
    }
    if (!("serviceWorker" in navigator)) {
      setSupported(false);
      return;
    }
    setSupported(true);
    navigator.serviceWorker
      .register("/Fortnite-objective/sw.js", { scope: "/Fortnite-objective/" })
      .catch(() => {
        setSupported(false);
      });
  }, []);

  if (supported === false) return null;
  return null;
}
