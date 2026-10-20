import React from "react";
import { createRoot } from "react-dom/client";
import { StorefrontDemo } from "./main";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><StorefrontDemo /></React.StrictMode>,
);
