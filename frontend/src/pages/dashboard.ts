import { state } from "../state";
import { getUsers } from "../services/userService";
import { connectToWebSocket } from "../services/auth";
import Navbar from "../components/navbar";
import { navigateTo } from "../router";

export default function Dashboard(): HTMLElement {
    console.log("🖥 Rendu du dashboard...");

    if (!state.user) {
        console.log("❌ Utilisateur non connecté. Redirection...");
        setTimeout(() => {
            if (!state.user) {
                navigateTo(new Event("click"), "/login");
            }
        }, 200);
        return document.createElement("div");
    }

    console.log("✅ Utilisateur connecté :", state.user.username);

    const container = document.createElement("div");
    container.className = "flex flex-col items-center min-h-screen bg-black text-white relative overflow-hidden";

    // ✅ Réintégration du fond visuel
    container.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        <div class="absolute inset-0 bg-stars animate-twinkling"></div>
    `;

    // ✅ Ajout de la navbar
    const navbar = Navbar();
    navbar.className = "relative z-20 w-full"; // Assure que la navbar est bien visible au-dessus du fond
    container.appendChild(navbar);

    const mainSection = document.createElement("div");
    mainSection.className = "relative z-10 flex flex-col items-center p-8 w-full max-w-3xl mx-auto text-center";

    const title = document.createElement("h2");
    title.innerText = `🌌 Bienvenue, ${state.user.username} !`;
    title.className = "text-4xl font-bold text-purple-400 drop-shadow-md";

    const usersSection = document.createElement("div");
    usersSection.className = "mt-8 bg-gray-800 bg-opacity-50 p-4 rounded-lg shadow-lg w-full max-w-md";

    const usersTitle = document.createElement("h3");
    usersTitle.innerText = "🌠 Joueurs en ligne";
    usersTitle.className = "text-xl text-green-300 mb-2";

    const usersList = document.createElement("ul");
    usersList.className = "text-white text-lg space-y-2";

    usersSection.append(usersTitle, usersList);
    mainSection.append(title, usersSection);
    container.appendChild(mainSection);

    async function loadUsers() {
        const users = await getUsers();
        usersList.innerHTML = ""; 

        users.sort((a, b) => (a.status === "online" ? -1 : 1));

        users.forEach((user) => {
            const li = document.createElement("li");
            li.id = `user-${user.id}`;
            li.className = `p-2 rounded ${user.status === "online" ? "text-green-400" : "text-red-400"}`;
            li.innerText = `${user.username} ${user.status === "online" ? "🟢" : "🔴"}`;
            usersList.appendChild(li);
        });
    }

    function updateUserStatus(userId: string, status: string) {
        const userElement = document.getElementById(`user-${userId}`);
        if (userElement) {
            userElement.className = `p-2 rounded ${status === "online" ? "text-green-400" : "text-red-400"}`;
            userElement.innerText = `${userElement.innerText.split(" ")[0]} ${status === "online" ? "🟢" : "🔴"}`;

            if (status === "online") {
                usersList.prepend(userElement);
            }
        }
    }

    connectToWebSocket(String(state.user.id), (message) => {
        if (message.type === "user_status") {
            updateUserStatus(message.userId, message.status);
        }
    });

    loadUsers();

    return container;
}
