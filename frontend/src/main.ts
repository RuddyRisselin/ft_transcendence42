import { setupRouter } from "./router";
import { loadAuthData } from "./services/auth";

document.addEventListener("DOMContentLoaded", () => {
    console.log("🔹 Chargement de l'application...");

    // ✅ Vérifie si `loadAuthData` existe et le charge
    if (typeof loadAuthData === "function") {
        loadAuthData();
        console.log("✅ Données utilisateur chargées !");
    } else {
        console.warn("⚠️ `loadAuthData` est introuvable !");
    }

    // ✅ Initialise le routeur
    setupRouter();
});
