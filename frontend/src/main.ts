import { setupRouter } from "./router";
import { loadAuthData } from "./services/auth";

document.addEventListener("DOMContentLoaded", () => {
  loadAuthData(); // Assure que les données utilisateur sont bien chargées
  setupRouter();
});
