import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Petit polyfill tactile minimal qui permet d'utiliser le HTML5 drag & drop
// sur appareils tactiles sans dépendance externe. Il observe les éléments
// `draggable` et expose un évènement personnalisé `touchdrop` sur la colonne cible.
(function () {
  if (typeof window === "undefined" || !("ontouchstart" in window)) return;

  let draggingId = null;

  window.addEventListener(
    "touchstart",
    function (e) {
      const t = e.target.closest && e.target.closest("[draggable]");
      if (!t) return;
      const id = t.dataset.cardId || t.getAttribute("data-card-id");
      if (!id) return;
      draggingId = String(id);
      t.classList.add("dragging");
      e.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener(
    "touchmove",
    function (e) {
      if (!draggingId) return;
      const touch = e.touches[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      document
        .querySelectorAll(".drop-target")
        .forEach((x) => x.classList.remove("drop-target"));
      const drop = el && el.closest && el.closest("[data-column-id]");
      if (drop) drop.classList.add("drop-target");
      e.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener(
    "touchend",
    function (e) {
      if (!draggingId) return;
      const touch = e.changedTouches && e.changedTouches[0];
      if (!touch) {
        draggingId = null;
        return;
      }
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const drop = el && el.closest && el.closest("[data-column-id]");
      if (drop) {
        const ev = new CustomEvent("touchdrop", {
          detail: { cardId: draggingId },
        });
        drop.dispatchEvent(ev);
      }
      draggingId = null;
      document
        .querySelectorAll(".drop-target")
        .forEach((x) => x.classList.remove("drop-target"));
      document
        .querySelectorAll(".dragging")
        .forEach((x) => x.classList.remove("dragging"));
    },
    { passive: false }
  );
})();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
