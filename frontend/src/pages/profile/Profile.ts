import { state } from "../../state";
import ProfileForm from "./ProfileForm";
import MatchHistory from "./MatchHistory";
import Leaderboard from "./Leaderboard";
import StarsBackground from "./StarsBackground";
import ProfileStats from "./ProfileStats";
import Sidebar from "../../components/sidebar";

export default function Profile(): HTMLElement {
    if (!state.user) {
        window.location.href = "/login";
        return document.createElement("div");
    }
    document.body.classList.add("overflow-hidden");
    const mainContainer = document.createElement("div");
    mainContainer.className = "flex w-full h-screen overflow-hidden bg-gray-900";
    
    // Ajouter la sidebar
    const sidebar = Sidebar();
    mainContainer.appendChild(sidebar);
    
    const profileWrapper = document.createElement("div");
    profileWrapper.className = "relative flex-1 h-screen flex flex-col ml-0 md:ml-64"; // Marge à gauche sur desktop pour la sidebar

    profileWrapper.appendChild(StarsBackground());
    
    const layoutWrapper = document.createElement("div");
    layoutWrapper.className = "grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-screen p-6 md:pl-10 overflow-y-auto"; // Ajout de padding à gauche pour l'ondulation

    // Rangée supérieure avec Profile Management et Leaderboard
    const topRow = document.createElement("div");
    topRow.className = "lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6";

    const profileSection = document.createElement("div");
    profileSection.className = "lg:col-span-3 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center";
    
    ProfileForm().then(container => {
        profileSection.append(container);
    })

    const leaderboard = document.createElement("div");
    leaderboard.className = "lg:col-span-6 bg-gray-800 rounded-lg shadow-lg flex flex-col";
    leaderboard.append(Leaderboard());

    const history = document.createElement("div");
    history.className = "lg:col-span-3 bg-gray-800 rounded-lg shadow-lg flex flex-col";
    MatchHistory().then(container => {
        history.innerHTML = "";
        history.append(container);
    })

    topRow.append(profileSection, leaderboard, history);
    
    // Rangée inférieure avec les stats
    const stats = ProfileStats();
    stats.className = "lg:col-span-12 bg-gray-800 rounded-lg shadow-lg";

    layoutWrapper.append(topRow, stats);
    
    // Bouton pour basculer la visibilité de la sidebar sur mobile
    const toggleSidebarButton = document.createElement("div");
    toggleSidebarButton.className = "fixed top-4 right-4 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer text-white text-base transition duration-300 transform hover:scale-110 hover:bg-gray-600 shadow-lg z-10 md:hidden";
    toggleSidebarButton.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`;
    
    toggleSidebarButton.onclick = () => {
        // Sur mobile, basculer la visibilité de la sidebar
        if (sidebar.classList.contains("hidden")) {
            sidebar.classList.remove("hidden");
            sidebarOverlay.classList.remove("hidden");
        } else {
            sidebar.classList.add("hidden");
            sidebarOverlay.classList.add("hidden");
        }
    };
    
    // Créer un overlay sombre lorsque la sidebar est ouverte sur mobile
    const sidebarOverlay = document.createElement("div");
    sidebarOverlay.className = "fixed inset-0 bg-black bg-opacity-50 z-20 hidden md:hidden";
    sidebarOverlay.onclick = () => {
        sidebar.classList.add("hidden");
        sidebarOverlay.classList.add("hidden");
    };
    
    // Ajuster le style de la sidebar pour qu'elle soit cachée par défaut sur mobile
    sidebar.classList.add("hidden", "md:flex");
    
    profileWrapper.append(toggleSidebarButton, sidebarOverlay, layoutWrapper);
    
    mainContainer.appendChild(profileWrapper);

    return mainContainer;
}
