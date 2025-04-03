import Home from "./pages/home";
import Game from "./pages/game";
import Profile from "./pages/profile/Profile";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import LocalMatch from "./pages/localMatch"
import GameLocal from "./pages/gameLocal"
import TournamentSettings from "./pages/tournamentSettings";
import TournamentBracket from "./pages/tournamentBracket";
import GameTournament from "./pages/gameTournament";
import { isAuthenticated } from "./services/auth";
//import Match from "./pages/match";

const routes: Record<string, () => Promise<HTMLElement> | HTMLElement> = {
  "/": Home,
  "/game": Game,
  "/profile": async () => (isAuthenticated() ? await Profile() : await Login()),
  "/login": Login,
  "/dashboard": async () => (isAuthenticated() ? await Dashboard() : await Login()),
  "/tournament": () => TournamentSettings(),
  "/tournament-bracket": () => TournamentBracket(),
  "/tournament-game": () => GameTournament(),
  "/local-match": LocalMatch,
  "/game-local": GameLocal,
  "/register": Register
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
