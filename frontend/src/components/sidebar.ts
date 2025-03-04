import { state } from "../state";
import { logout } from "../services/auth";
import { getUsers } from "../services/userService";


export default function Sidebar(): HTMLElement {
    const sidebar = document.createElement("aside");
    sidebar.className = "fixed inset-y-0 left-0 w-64 bg-gray-900 text-white flex flex-col shadow-lg z-20";

    // Conteneur de l'utilisateur connecté
    const userContainer = document.createElement("div");
    userContainer.className = "flex flex-col items-center p-4 border-b border-gray-700";

    // Avatar
    const avatar = document.createElement("img");
    avatar.src = state.user?.avatar || "/public/avatars/default.png";
    avatar.className = "w-12 h-12 rounded-full border-2 border-white";

    // Nom d'utilisateur
    const username = document.createElement("span");
    username.innerText = `Hi, ${state.user?.username || "Guest"}!`;
    username.className = "text-lg font-semibold mt-2";

    // Statut (Online/Offline)
    const statusContainer = document.createElement("div");
    statusContainer.className = "flex items-center mt-4";

    const statusIndicator = document.createElement("span");
    statusIndicator.className = "w-3 h-3 rounded-full mr-2";

    const statusText = document.createElement("span");
    statusText.className = "text-sm";

    async function updateStatus() {
        const users = await getUsers();
        const currentUser = users.find(user => user.id === state.user?.id);
        
        if (currentUser) {
            statusIndicator.className = `w-3 h-3 rounded-full mr-2 ${currentUser.status === "online" ? "bg-green-500" : "bg-red-500"}`;
            statusText.innerText = currentUser.status === "online" ? "En ligne" : "Hors ligne";
        }
    }

    updateStatus();
    setInterval(updateStatus, 5000); // Met à jour toutes les 5 secondes

    statusContainer.append(statusIndicator, statusText);
    sidebar.appendChild(statusContainer);

    statusContainer.append(statusIndicator, statusText);
    userContainer.append(avatar, username, statusContainer);

    // Effet ondulé sur la bordure droite
    const waveContainer = document.createElement("div");
    waveContainer.className = "absolute inset-y-0 -right-5 w-16 text-gray-900 -z-10";
    waveContainer.innerHTML = `
    <svg class="absolute inset-0 w-full h-full text-gray-900"
    style="filter: drop-shadow(10px 0 10px #00000030)"
    preserveAspectRatio="none"
    viewBox="0 0 309 800"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M268.487 0H0V800H247.32C207.957 725 207.975 492.294 268.487 367.647C329 243 314.906 53.4314 268.487 0Z"/>
    </svg>
    `;

    // Navigation
    const nav = document.createElement("nav");
    nav.className = "flex flex-col mt-4 space-y-4 relative z-10";

    const navLinks = [
        { icon: "🏠", text: "Dashboard", href: "/dashboard" },
        { icon: "👤", text: "Profile", href: "/profile" },
        { icon: "🎮", text: "Matches", href: "/matches" },
        { icon: "📜", text: "Rules", href: "/rules" }
    ];

    navLinks.forEach(link => {
        const a = document.createElement("a");
        a.href = link.href;
        a.className = "flex items-center p-3 hover:bg-gray-700 rounded transition duration-200";

        const icon = document.createElement("span");
        icon.innerText = link.icon;
        icon.className = "mr-2 text-lg";

        const text = document.createElement("span");
        text.innerText = link.text;

        a.append(icon, text);
        nav.appendChild(a);
    });

    // Bouton de déconnexion
    const logoutButton = document.createElement("button");
    logoutButton.className = "mt-auto p-3 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center rounded transition duration-200";
    logoutButton.innerHTML = "🔒 Logout";
    logoutButton.onclick = async () => {
        await logout();
    };

    sidebar.append(userContainer, nav, logoutButton, waveContainer);

    return sidebar;
}
