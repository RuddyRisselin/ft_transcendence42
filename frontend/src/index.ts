import { loadAuthData } from "./services/auth";
import { initRouter } from "./router";
import { state } from "./state";

// Détection des rafraîchissements de page pour éviter le changement de statut inutile
window.addEventListener('beforeunload', function() {
    // Marquer qu'il s'agit d'un rafraîchissement et non d'une déconnexion réelle
    sessionStorage.setItem('refreshing', 'true');
    
    // Conserver le statut en ligne pendant le rafraîchissement
    if (state.socket) {
        // On ne fermera pas le socket normalement pour éviter le changement de statut
        console.log("⚠️ Rafraîchissement de page détecté, maintien du statut en ligne");
    }
});

// Au chargement de la page, vérifier s'il s'agit d'un rafraîchissement
window.addEventListener('load', function() {
    const wasRefreshing = sessionStorage.getItem('refreshing');
    if (wasRefreshing) {
        console.log("✅ Page rafraîchie, restauration de la session");
        // Nettoyer le marqueur après utilisation
        sessionStorage.removeItem('refreshing');
    }
    
    // Charger les données d'authentification si disponibles
    loadAuthData();
    
    // Initialiser le routeur après le chargement des données d'auth
    initRouter();
}); 