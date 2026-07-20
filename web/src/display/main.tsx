import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { projectorRequested } from "../lib/useAmbientMode.js";
import { Display } from "./Display.js";
import "../styles/display.css";

if (projectorRequested()) {
  document.title = import.meta.env.VITE_COMPANION_ENABLED === "1"
    ? "Brenton's Ceiling Projector — Option 4"
    : "Brenton's Overhead — Live Aircraft";

  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "/overhead.webmanifest";
  document.head.appendChild(manifest);

  const theme = document.createElement("meta");
  theme.name = "theme-color";
  theme.content = "#000000";
  document.head.appendChild(theme);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Display />
  </StrictMode>,
);
