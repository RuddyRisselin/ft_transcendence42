import { state } from "../../state";
import { updateUser, deleteUser, anonymizeUser } from "../../services/userService";
import { logout } from "../../services/auth";

export default function ProfileForm(): HTMLElement {
    const container = document.createElement("div");
    container.className = "flex flex-col items-start p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 border border-gray-700";

    const title = document.createElement("h2");
    title.innerText = "Profile Management";
    title.className = "text-3xl font-bold mb-4 text-left text-blue-400";

    const avatar = document.createElement("img");
    avatar.src = state.user.avatar || "default-avatar.png";
    avatar.className = "w-24 h-24 rounded-full border-2 border-blue-400 mb-3";

    const username = document.createElement("input");
    username.type = "text";
    username.value = state.user.username;
    username.className = "input-style";

    const email = document.createElement("input");
    email.type = "email";
    email.value = state.user.email;
    email.className = "input-style";

    const anonymize = state.user.anonymize;
    if (anonymize === 1)
    {
        username.disabled = true;
        email.disabled = true;
    }
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Update profile";
    saveBtn.className = "btn-primary";
    if (anonymize === 1)
        saveBtn.disabled = true;
    saveBtn.onclick = async () => {
    let token = state.token;
    if (!token)
        token = "";
        const success = await updateUser(token, state.user.username, username.value, email.value);
        if (success) {
            state.user.username = username.value;
            state.user.email = email.value;
            alert("Profile updated!");
        } else {
            alert("Error profile update impossible");
        }
    };
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete account";
    deleteBtn.className = "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-auto mt-2";
    deleteBtn.onclick = async () => {
        try {
            const value = confirm("Are you sure ?");
            if (value)
            {
                const success = await deleteUser(state.user.username);
                if (success) {
                    alert("Profil deleted!");
                    await logout();
                } else {
                    alert("Error delete profil");
                }
            }
            } catch (error) {
                console.error("❌ Erreur inattendue :", error);
                alert("Une erreur est survenue !");
            }
    };

    const anonymizeBtn = document.createElement("button");
    let token = state.token;
    if (!token)
        token = "";
    if (state.user.anonymize === 0)
        anonymizeBtn.innerText = "Going private";
    else
        anonymizeBtn.innerText = "Going public";
    anonymizeBtn.className = "bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mx-auto mt-2";
    anonymizeBtn.onclick = async () => {
        try {
            const value = confirm("Are you sure ?");
            if (value)
            {
                const success = await anonymizeUser(state.user.username, token);
                if (success && anonymizeBtn.textContent === "Going private") {
                    alert("Your profil is private!");
                    anonymizeBtn.innerText = "Going public";
                }
                else if (success && anonymizeBtn.textContent === "Going public")
                {
                    alert("Your profil is public!");
                    anonymizeBtn.innerText = "Going private";
                }
                else
                    alert("Error request profil");
                window.location.reload();
            }
            } catch (error) {
                console.error("❌ Erreur inattendue :", error);
                alert("Une erreur est survenue !");
            }
    };
    container.append(title, avatar, username, email, saveBtn, anonymizeBtn, deleteBtn);
    return container;
}
