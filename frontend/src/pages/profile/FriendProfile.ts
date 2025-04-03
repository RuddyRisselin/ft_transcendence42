import { state } from "../../state";
import ProfileStats from "./ProfileStats";
import MatchHistory from "./MatchHistory";
import Leaderboard from "./Leaderboard";
import StarsBackground from "./StarsBackground";
import BackButton from "./BackButton";
import { getFriendDetails } from "../../services/friendService";
import { translateText } from "../../translate";

export default async function FriendProfile(friendId: number): Promise<HTMLElement> {
    const textsToTranslate = [
        "Chargement...",
        "Profil non disponible",
        "Statut inconnu",

        "Jouer maintenant",
        "Local vs IA"
    ];

    const [
        translatedLoading,
        translatedProfilNotFound, 
        translatedUnknownStatus, 
        translatedPlayNow, 
        translatedLocalAI, 
        translatedAIDesc, 
        translatedPlayAI,
        translatedDifficulty,
        translatedEasy,
        translatedNormal,
        translatedHard,
        transletedCancel,
        translatedTournament,
        translatedTournamentDesc,
        translatedPlayTournament
    ] = await Promise.all(textsToTranslate.map(text => translateText(text)));

    document.body.classList.add("overflow-hidden");
    const mainContainer = document.createElement("div");
    mainContainer.className = "flex w-full h-screen overflow-hidden bg-gray-900";
    
    const profileWrapper = document.createElement("div");
    profileWrapper.className = "relative flex-1 h-screen flex flex-col";

    profileWrapper.appendChild(StarsBackground());
    
    const layoutWrapper = document.createElement("div");
    layoutWrapper.className = "grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-screen p-6 overflow-y-auto";

    // Rangée supérieure avec Profile Info, Leaderboard et History
    const topRow = document.createElement("div");
    topRow.className = "lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6";

    // Section profil (gauche)
    const profileSection = document.createElement("div");
    profileSection.className = "lg:col-span-3 bg-gray-800/50 rounded-lg shadow-lg flex flex-col items-center p-6 relative";

    // Cercle bleu autour de l'avatar
    const avatarCircle = document.createElement("div");
    avatarCircle.className = "w-32 h-32 rounded-full border-2 border-blue-400/50 flex items-center justify-center mb-4 relative";

    // Avatar
    const avatar = document.createElement("img");
    avatar.src = "http://localhost:3000/images/default.jpg";
    avatar.className = "w-24 h-24 rounded-full";

    avatarCircle.appendChild(avatar);

    // Nom d'utilisateur
    const username = document.createElement("h2");
    username.className = "text-xl font-bold text-white/90 mb-3";
    username.innerHTML = translatedLoading;

    // Status avec icône
    const status = document.createElement("div");
    status.className = "flex items-center gap-2 text-gray-400";

    const statusIndicator = document.createElement("span");
    statusIndicator.className = "w-2 h-2 rounded-full bg-gray-500";

    const statusText = document.createElement("span");
    statusText.className = "text-sm";
    statusText.innerHTML = translatedLoading;

    status.append(statusIndicator, statusText);

    // Bouton retour en haut à gauche
    const backButtonContainer = document.createElement("div");
    backButtonContainer.className = "absolute top-4 left-4";
    backButtonContainer.appendChild(BackButton());

    profileSection.append(backButtonContainer, avatarCircle, username, status);

    // Section Leaderboard (milieu)
    const leaderboard = document.createElement("div");
    leaderboard.className = "lg:col-span-6 bg-gray-800/50 rounded-lg shadow-lg flex flex-col";
    Leaderboard().then(container => {
        leaderboard.append(container);
    })

    // Section History (droite)
    const history = document.createElement("div");
    history.className = "lg:col-span-3 bg-gray-800/50 rounded-lg shadow-lg flex flex-col";
    MatchHistory().then(container => {
        history.innerHTML = "";
        history.append(container);
    })

    topRow.append(profileSection, leaderboard, history);
    
    // Rangée inférieure avec les stats
    const stats = ProfileStats(friendId);
    (await stats).className = "lg:col-span-12 bg-gray-800/50 rounded-lg shadow-lg";

    layoutWrapper.append(topRow, await stats);
    profileWrapper.appendChild(layoutWrapper);
    mainContainer.appendChild(profileWrapper);

    // Charger les informations de l'ami
    async function loadFriendInfo() {
        try {
            const friend = await getFriendDetails(friendId);
            
            if (!friend) {
                throw new Error("Ami non trouvé");
            }

            avatar.src = `http://localhost:3000/images/${friend.avatar || "default.jpg"}`;
            username.innerHTML = friend.username;
            
            statusIndicator.className = `w-2 h-2 rounded-full ${friend.status === "online" ? "bg-green-500" : "bg-red-500"}`;
            statusText.innerHTML = friend.status === "online" ? (localStorage.getItem("language") == "fr" ? "En ligne" :  await translateText("online")) : (localStorage.getItem("language") == "fr" ? "Hors ligne" :  await translateText("offline"));
            if (friend.status === "online") {
                avatarCircle.className = "w-32 h-32 rounded-full border-2 border-green-400/50 flex items-center justify-center mb-4 relative";
            } else {
                avatarCircle.className = "w-32 h-32 rounded-full border-2 border-red-400/50 flex items-center justify-center mb-4 relative";
            }
        } catch (error) {
            username.innerHTML = translatedProfilNotFound;
            statusText.innerHTML = translatedUnknownStatus;
        }
    }

    loadFriendInfo();

    return mainContainer;
} 