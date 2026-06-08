"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/Fortnite-objective/sw.js", { scope: "/Fortnite-objective/" })
        .catch(() => {});
    }
  }, []);
  return null;
}
