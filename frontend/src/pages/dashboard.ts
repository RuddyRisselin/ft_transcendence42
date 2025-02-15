import { state } from "../state";
import { getUsers } from "../services/userService";

export default function Dashboard(): HTMLElement {
    // Vérifie si l'utilisateur est connecté, sinon redirection vers login
    if (!state.user) {
        window.location.href = "/login";
        return document.createElement("div");
    }

    // Création du conteneur principal
    const container = document.createElement("div");
    container.className = "flex flex-col items-center p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 mx-auto mt-20 border border-gray-700";

    // Titre personnalisé
    const title = document.createElement("h2");
    title.innerText = `🏠 Bienvenue ${state.user.username}`;
    title.className = "text-3xl font-bold mb-4 text-center text-blue-400";

    // Sous-titre
    const subtitle = document.createElement("p");
    subtitle.innerText = "📡 Liste des utilisateurs";
    subtitle.className = "text-lg text-gray-300";

    // Liste des amis
    const friendsList = document.createElement("ul");
    friendsList.className = "mt-4 text-white";

    // Fonction pour charger les utilisateurs
    async function loadFriends() {
        const friends = await getUsers();
        friendsList.innerHTML = ""; // On vide la liste avant de la recharger

        friends.forEach((friend) => {
            const li = document.createElement("li");
            li.innerText = `${friend.username}`;
            friendsList.appendChild(li);
        });
    }

    // Chargement initial de la liste
    loadFriends();

    // Bouton vers le profil
    const profileButton = document.createElement("button");
    profileButton.innerText = "👤 Voir mon profil";
    profileButton.className = "btn-primary mt-4";
    profileButton.onclick = () => {
        window.location.href = "/profile";
    };

    // Ajout des éléments au conteneur
    container.append(title, subtitle, friendsList, profileButton);
    return container;
}
