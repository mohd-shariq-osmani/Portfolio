import type Lenis from "lenis";

let activeLenis: Lenis | null = null;

export function setActiveLenis(instance: Lenis | null) {
  activeLenis = instance;
}

export function scrollToTarget(target: string, offset = -88) {
  if (typeof window === "undefined") return;

  const element = document.getElementById(target.replace(/^#/, ""));
  if (!element) return;

  if (activeLenis) {
    activeLenis.scrollTo(element, { offset });
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function scrollToTop() {
  if (activeLenis) {
    activeLenis.scrollTo(0);
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}
