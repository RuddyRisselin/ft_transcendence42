import { logout } from "../services/auth";
import { navigateTo } from "../router";

export default function Navbar() {
    const navbar = document.createElement("nav");
    navbar.className = "fixed top-4 left-0 w-full flex justify-center z-50";

    const navContainer = document.createElement("div");
    navContainer.className = "bg-gray-900 bg-opacity-70 px-8 py-3 rounded-full flex items-center gap-6 shadow-md border border-gray-800";

    // Titre du site
    const title = document.createElement("h1");
    title.innerText = "🚀 Ft Transcendence";
    title.className = "text-lg font-bold text-purple-300 cursor-pointer transition-transform transform hover:scale-105";
    title.onclick = (e) => navigateTo(e, "/");

    // Conteneur des boutons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "flex gap-3";

    // Bouton Dashboard
    const dashboardBtn = document.createElement("button");
    dashboardBtn.innerText = "🏠 Dashboard";
    dashboardBtn.className = "px-5 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg transition-all transform hover:scale-105 hover:bg-gray-600";
    dashboardBtn.onclick = (e) => navigateTo(e, "/dashboard");

    // Bouton Profil
    const profileBtn = document.createElement("button");
    profileBtn.innerText = "👤 Profil";
    profileBtn.className = "px-5 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg transition-all transform hover:scale-105 hover:bg-gray-600";
    profileBtn.onclick = (e) => navigateTo(e, "/profile");

    // Bouton Logout
    const logoutBtn = document.createElement("button");
    logoutBtn.innerText = "🚪 Déconnexion";
    logoutBtn.className = "px-5 py-2 bg-gray-800 text-red-400 border border-red-500 rounded-lg transition-all transform hover:scale-105 hover:bg-gray-700";
    logoutBtn.onclick = async () => {
        await logout();
    };

    buttonsContainer.append(dashboardBtn, profileBtn, logoutBtn);
    navContainer.append(title, buttonsContainer);
    navbar.appendChild(navContainer);

    return navbar;
}
