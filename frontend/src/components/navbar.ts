import { isAuthenticated, logout } from "../services/auth";
import { navigateTo } from "../router";

export default function Navbar() {
  const nav = document.createElement("nav");
  nav.className = "bg-gray-900 p-4 flex justify-between";

  const homeLink = document.createElement("a");
  homeLink.innerText = "Accueil";
  homeLink.className = "text-white cursor-pointer";
  homeLink.onclick = () => navigateTo(new Event("click"),"/");

  const buttonsContainer = document.createElement("div");

  if (isAuthenticated()) {
    const profileBtn = document.createElement("button");
    profileBtn.innerText = "Profil";
    profileBtn.className = "text-white mx-2";
    profileBtn.onclick = () => navigateTo(new Event("click"),"/profile");

    const logoutBtn = document.createElement("button");
    logoutBtn.innerText = "Déconnexion";
    logoutBtn.className = "text-red-400 mx-2";
    logoutBtn.onclick = logout;

    buttonsContainer.appendChild(profileBtn);
    buttonsContainer.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement("button");
    loginBtn.innerText = "Connexion";
    loginBtn.className = "text-white mx-2";
    loginBtn.onclick = () => navigateTo(new Event("click"),"/login");

    const registerBtn = document.createElement("button");
    registerBtn.innerText = "S'inscrire";
    registerBtn.className = "text-white mx-2";
    registerBtn.onclick = () => navigateTo(new Event("click"),"/register");

    buttonsContainer.appendChild(loginBtn);
    buttonsContainer.appendChild(registerBtn);
  }

  nav.appendChild(homeLink);
  nav.appendChild(buttonsContainer);

  return nav;
}
