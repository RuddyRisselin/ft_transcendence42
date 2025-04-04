import Home from "./pages/home";
import Game from "./pages/game";
import Dashboard from "./pages/profile/Dashboard";
import Login from "./pages/login";
import Register from "./pages/register";
import Matches from "./pages/matches";
import LocalMatch from "./pages/localMatch"
import GameLocal from "./pages/gameLocal"
import TournamentSettings from "./pages/tournamentSettings";
import TournamentBracket from "./pages/tournamentBracket";
import GameTournament from "./pages/gameTournament";
import { isAuthenticated } from "./services/auth";
import Rules from "./pages/rules";
//import Match from "./pages/match";

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
  "/register": Register,
  "/rules": async () => await Rules()
};

export function navigateTo(event: Event, path: string) {
  event.preventDefault();
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
}

(window as any).navigateTo = navigateTo;

export function setupRouter() {
  const app: HTMLElement | null = document.getElementById("app");
  if (!app) return;

  const render: () => Promise<void> = async () => {
    setTimeout(async () => {
      const path: string = window.location.pathname;
      const page: () => Promise<HTMLElement> | HTMLElement = routes[path] || Home;
      app.innerHTML = "";
      app.appendChild(await page());
    }, 100);
  };

  window.addEventListener("popstate", render);
  render();
}
