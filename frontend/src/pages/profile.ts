import { state } from "../state";
import { updateUser } from "../services/userService";

export default function Profile(): HTMLElement {
    if (!state.user) {
        window.location.href = "/login";
        return document.createElement("div");
    }

    const container = document.createElement("div");
    container.className = "flex flex-col items-start p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 mt-6 ml-24 border border-gray-700";

    const title = document.createElement("h2");
    title.innerText = "Profile Management";
    title.className = "text-3xl font-bold mb-4 text-left text-blue-400";

    // Avatar
    const avatar = document.createElement("img");
    avatar.src = state.user.avatar || "default-avatar.png";
    avatar.className = "w-24 h-24 rounded-full border-2 border-blue-400 mb-3";

    // Username
    const username = document.createElement("input");
    username.type = "text";
    username.value = state.user.username;
    username.className = "input-style";

    // Email
    const email = document.createElement("input");
    email.type = "email";
    email.value = state.user.email;
    email.className = "input-style";

    // Save button
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Save";
    saveBtn.className = "btn-primary";
    saveBtn.onclick = async () => {
        const success = await updateUser(username.value, email.value);
        if (success) {
            state.user.username = username.value;
            state.user.email = email.value;
            alert("Profile updated!");
        } else {
            alert("Error updating profile");
        }
    };

    // Back button
    const backButton = document.createElement("div");
    backButton.className = "absolute top-6 left-6 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer text-white text-xl transition duration-300 transform hover:scale-110 hover:bg-gray-600 shadow-lg";
    backButton.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>`;
    backButton.onclick = () => {
        window.history.back();
    };

    // Layout inspired by the reference image
    const layoutWrapper = document.createElement("div");
    layoutWrapper.className = "grid grid-cols-12 gap-4 w-full h-screen p-4";

    // Profile section (left column)
    const profileSection = document.createElement("div");
    profileSection.className = "col-span-3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center";
    profileSection.append(title, avatar, username, email, saveBtn);
    
    // Sidebar leaderboard (right column)
    const leaderboard = document.createElement("div");
    leaderboard.className = "col-span-6 bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-center";
    leaderboard.innerText = "Leaderboard";

    // Match history section
    const history = document.createElement("div");
    history.className = "col-span-3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col";
    
    const historyTitle = document.createElement("h3");
    historyTitle.innerText = "Matches History";
    historyTitle.className = "text-lg font-bold text-white mb-2";
    
    const historyList = document.createElement("div");
    historyList.className = "flex flex-col gap-2";
    
    async function fetchMatchHistory() {
        try {
            const response = await fetch(`/api/matches?userId=${state.user.id}`);
            const matches = await response.json();
    
            console.log("Matches received:", matches);
    
            matches.forEach(match => {
                console.log(`Appending match: ${match.player1_name} vs ${match.player2_name} - Winner: ${match.winner_name}`);
    
                const matchItem = document.createElement("div");
                const isWinner = match.winner_name === state.user.username;
                matchItem.className = `p-2 rounded-lg text-white text-sm flex items-center space-x-2 ${isWinner ? "bg-blue-600" : "bg-red-600"}`;
                
                const player1Avatar = document.createElement("img");
                player1Avatar.src = match.player1_avatar || "default-avatar.png";
                player1Avatar.className = "w-8 h-8 rounded-full border-2 border-white";
                
                const player2Avatar = document.createElement("img");
                player2Avatar.src = match.player2_avatar || "default-avatar.png";
                player2Avatar.className = "w-8 h-8 rounded-full border-2 border-white";
                
                const matchText = document.createElement("span");
                matchText.innerText = `${new Date(match.played_at).toLocaleDateString()} - ${match.player1_name} VS ${match.player2_name} → Winner: ${match.winner_name}`;
                
                matchItem.append(player1Avatar, matchText, player2Avatar);
                historyList.appendChild(matchItem);
            });
        } catch (error) {
            console.error("Error fetching match history:", error);
        }
    }
    
    fetchMatchHistory();
    history.append(historyTitle, historyList);
    
    // Stats section (bottom spanning full width)
    const stats = document.createElement("div");
    stats.className = "col-span-12 bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-center";
    stats.innerText = "Stats";
    
    layoutWrapper.append(profileSection, leaderboard, history, stats);

    // Stars background
    const starsContainer = document.createElement("div");
    starsContainer.className = "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0";

    for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "absolute bg-white rounded-full opacity-75 animate-twinkle";
        const size = Math.random() * 3 + "px";
        star.style.width = size;
        star.style.height = size;
        star.style.top = Math.random() * 100 + "vh";
        star.style.left = Math.random() * 100 + "vw";
        star.style.animationDuration = Math.random() * 3 + 2 + "s";
        starsContainer.appendChild(star);
    }

    const profileWrapper = document.createElement("div");
    profileWrapper.className = "relative w-full h-screen flex flex-col";
    profileWrapper.append(starsContainer, backButton, layoutWrapper);

    return profileWrapper;
}
