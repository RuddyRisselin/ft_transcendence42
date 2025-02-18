import { state } from "../../state";
import ProfileForm from "./ProfileForm";
import MatchHistory from "./MatchHistory";
import Leaderboard from "./Leaderboard";
import StarsBackground from "./StarsBackground";
import BackButton from "./BackButton";
import ProfileStats from "./ProfileStats";

export default function Profile(): HTMLElement {
    if (!state.user) {
        window.location.href = "/login";
        return document.createElement("div");
    }

    // Wrapper général
    const profileWrapper = document.createElement("div");
    profileWrapper.className = "relative w-full h-screen flex flex-col";

    // Stars background
    profileWrapper.appendChild(StarsBackground());
    

    // Layout principal
    const layoutWrapper = document.createElement("div");
    layoutWrapper.className = "grid grid-cols-12 gap-4 w-full h-screen p-4";

    // Profile Section
    const profileSection = document.createElement("div");
    profileSection.className = "col-span-3 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center";
    profileSection.append(ProfileForm());

    // Leaderboard Section
    const leaderboard = document.createElement("div");
    leaderboard.className = "col-span-6 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col";
    leaderboard.append(Leaderboard());

    // Match History Section
    const history = document.createElement("div");
    history.className = "col-span-3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col";
    history.append(MatchHistory());

    // Stats Section
    const stats = ProfileStats();

    // Ajout des éléments au layout
    layoutWrapper.append(profileSection, leaderboard, history, stats);

    // Ajout au wrapper principal
    profileWrapper.append(BackButton(), layoutWrapper);

    return profileWrapper;
}
