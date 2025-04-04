import Home from "./pages/home";
import Game from "./pages/game";
import Dashboard from "./pages/profile/Dashboard";
import Login from "./pages/login";
import Register from "./pages/register";
import Matches from "./pages/matches";
import LocalMatch from "./pages/localMatch"
import GameLocal from "./pages/gameLocal"
import GameAI from "./pages/gameAI";
import TournamentSettings from "./pages/tournamentSettings";
import TournamentBracket from "./pages/tournamentBracket";
import GameTournament from "./pages/gameTournament";
import { isAuthenticated } from "./services/auth";
import { state } from "./state";
import Sidebar from "./components/sidebar";
import Rules from "./pages/rules";
//import Match from "./pages/match";

// ✅ NOUVEAU: Fonction pour restaurer l'état depuis localStorage au chargement
function restoreStateFromLocalStorage() {
    const currentPage = localStorage.getItem('currentPage');
    
    // Restaurer l'état de l'utilisateur si nécessaire
    if (localStorage.getItem('userData')) {
        try {
            state.user = JSON.parse(localStorage.getItem('userData')!);
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des données utilisateur:", error);
        }
    }
    
    // Restaurer l'état du match local
    if (localStorage.getItem('localMatchData')) {
        try {
            state.localMatch = JSON.parse(localStorage.getItem('localMatchData')!);
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des données de match local:", error);
        }
    }
    
    // Restaurer l'état du tournoi
    if (localStorage.getItem('tournamentData')) {
        try {
            state.tournament = JSON.parse(localStorage.getItem('tournamentData')!);
            
            // Restaurer également le match actuel si disponible
            if (localStorage.getItem('currentMatchData') && state.tournament) {
                state.tournament.currentMatch = JSON.parse(localStorage.getItem('currentMatchData')!);
            }
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des données de tournoi:", error);
        }
    }
    
    console.log("✅ État restauré depuis localStorage, page actuelle:", currentPage);
}

const routes: Record<string, () => Promise<HTMLElement> | HTMLElement> = {
  "/": Home,
  "/game": Game,
  "/dashboard": async () => (isAuthenticated() ? await Dashboard() : await Login()),
  "/login": Login,
  "/matches": async () => (isAuthenticated() ? await Matches() : await Login()),
  "/tournament": () => TournamentSettings(),
  "/tournament-bracket": () => TournamentBracket(),
  "/tournament-game": () => GameTournament(),
  "/local-match": LocalMatch,
  "/game-local": GameLocal,
  "/game-ai": GameAI,
  "/register": Register,
  "/rules": async () => await Rules()
};

export function navigateTo(event: Event, path: string, popstate: boolean = false) {
  event.preventDefault();
  
  // ✅ NOUVEAU: Nettoyage des données de jeu lors de la navigation vers les pages de jeu
  if (path.includes('game-ai') || path.includes('game-local') || path.includes('tournament-game')) {
    console.log("✅ Navigation vers une page de jeu, nettoyage des données précédentes");
    
    // Nettoyer les données de jeu en fonction de la destination
    if (path.includes('game-ai')) {
      localStorage.removeItem('aiGameScores');
      localStorage.removeItem('aiGameState');
    }
    else if (path.includes('game-local')) {
      localStorage.removeItem('localGameScores');
      localStorage.removeItem('gameState');
    }
    else if (path.includes('tournament-game')) {
      localStorage.removeItem('tournamentGameScores');
      localStorage.removeItem('tournamentGameState');
    }
    
    // Retirer tous les overlays de victoire potentiellement présents
    const victoryOverlays = document.querySelectorAll('.victory-container');
    victoryOverlays.forEach(overlay => overlay.remove());
  }
  
  window.history.pushState({}, "", path);
  // Toujours déclencher l'événement popstate pour le rendu de la page
  window.dispatchEvent(new Event("popstate"));
}

(window as any).navigateTo = navigateTo;

export function initRouter() {
  // ✅ NOUVEAU: Restaurer l'état depuis localStorage au chargement de l'application
  restoreStateFromLocalStorage();

  const app = document.getElementById("app");
  if (!app) return;

  const render: () => Promise<void> = async () => {
    setTimeout(async () => {
      const path: string = window.location.pathname;
      
      // ✅ NOUVEAU: Redirection intelligente en cas de rechargement de page
      const currentPage = localStorage.getItem('currentPage');
      if (path === '/' && currentPage) {
        // Si nous sommes à la racine mais qu'une page était précédemment enregistrée,
        // nous pouvons supposer que c'est un rechargement de page
        console.log("🔄 Détection d'un rechargement de page, redirection vers:", currentPage);
        
        if (currentPage === 'game-local' && state.localMatch) {
          console.log("🎮 Restauration du match local en cours...");
          window.history.replaceState({}, "", "/game-local");
        } 
        else if (currentPage === 'tournament-game' && state.tournament && state.tournament.currentMatch) {
          console.log("🏆 Restauration du match de tournoi en cours...");
          window.history.replaceState({}, "", "/tournament-game");
        }
        else if (currentPage === 'game-ai' && state.aiMatch) {
          console.log("🤖 Restauration du match contre l'IA en cours...");
          window.history.replaceState({}, "", "/game-ai");
        }
      }
      
      const newPath = window.location.pathname;
      const page: () => Promise<HTMLElement> | HTMLElement = routes[newPath] || Home;
      app.innerHTML = "";
      app.appendChild(await page());

      // Réinitialiser la sidebar si l'utilisateur est connecté
      if (state.user && !document.querySelector(".sidebar-component")) {
        const sidebarContainer = document.createElement("div");
        sidebarContainer.className = "sidebar-container";
        Sidebar().then(container => {
          sidebarContainer.append(container);
        })
        document.body.appendChild(sidebarContainer);
      }
    }, 100); // Laisse 100ms pour s'assurer que `loadAuthData()` s'exécute
  };

  window.addEventListener("popstate", render);
  render();
}
