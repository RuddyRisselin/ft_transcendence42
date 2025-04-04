import { initRouter } from "./router";
import { loadAuthData } from "./services/auth";

async function init() {
    console.log("🔹 Chargement de l'application...");

    // ✅ Vérifie si `loadAuthData` existe et le charge
    if (typeof loadAuthData === "function") {
        await loadAuthData();
        console.log("✅ Données utilisateur chargées !");
    } else {
        console.warn("⚠️ `loadAuthData` est introuvable !");
    }

    // ✅ Initialise le routeur
    initRouter();
}

init();
