import Home from "./pages/home";
import Game from "./pages/game";
import Profile from "./pages/profile";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import { isAuthenticated } from "./services/auth";

const routes: Record<string, () => HTMLElement> = {
  "/": Home,
  "/game": Game,
  "/profile": () => (isAuthenticated() ? Profile() : Login()),
  "/login": Login,
  "/dashboard": Dashboard,
  "/register": Register
};

export function navigateTo(event: Event, path: string) {
  event.preventDefault();
  window.history.pushState({}, path, window.location.origin + path);
  window.dispatchEvent(new Event("popstate"));
}

export function setupRouter() {
  const app = document.getElementById("app");
  if (!app) return;

  const render = () => {
    const path = window.location.pathname;
    const page = routes[path] || Home;
    app.innerHTML = "";
    app.appendChild(page());
  };

  window.addEventListener("popstate", render);
  render();
}
