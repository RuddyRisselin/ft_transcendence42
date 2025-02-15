import { state } from "../state";
import { updateUser } from "../services/userService";

export default function Profile(): HTMLElement {
    if (!state.user) {
        window.location.href = "/login";
        return document.createElement("div");
    }

    const container = document.createElement("div");
    container.className = "flex flex-col items-center p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 mx-auto mt-20 border border-gray-700";

    const title = document.createElement("h2");
    title.innerText = "Profil";
    title.className = "text-3xl font-bold mb-4 text-center text-blue-400";

    // Avatar
    const avatar = document.createElement("img");
    avatar.src = state.user.avatar || "default-avatar.png";
    avatar.className = "w-24 h-24 rounded-full border-2 border-blue-400 mb-3";

    // Nom d'utilisateur
    const username = document.createElement("input");
    username.type = "text";
    username.value = state.user.username;
    username.className = "input-style";

    // Email
    const email = document.createElement("input");
    email.type = "email";
    email.value = state.user.email;
    email.className = "input-style";

    // Bouton sauvegarder
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Sauvegarder";
    saveBtn.className = "btn-primary";
    saveBtn.onclick = async () => {
        const success = await updateUser(username.value, email.value);
        if (success) {
            state.user.username = username.value;
            state.user.email = email.value;
            alert("Profil mis à jour !");
        } else {
            alert("Erreur lors de la mise à jour");
        }
    };

    container.append(title, avatar, username, email, saveBtn);
    return container;
}
