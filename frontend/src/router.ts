import Home from "./pages/home";
import Game from "./pages/game";
import Profile from "./pages/profile";
import ApiTest from "./pages/apiTest";

const routes: { [key: string]: () => HTMLElement } = {
  "/": Home,
  "/game": Game,
  "/profile": Profile,
  "/apiTest": ApiTest,
};

export function navigateTo(event: Event, path: string) {
  event.preventDefault();
  window.history.pushState({}, path, window.location.origin + path);
  render();
}

export function render() {
  const root = document.getElementById("app");
  if (!root) return;

  root.innerHTML = "";
  
  const page = routes[window.location.pathname] || Home;
  root.appendChild(page());
}

export default function router(path: string) {
  return routes[path] || Home;
}

window.addEventListener("popstate", render);
document.addEventListener("DOMContentLoaded", render);
