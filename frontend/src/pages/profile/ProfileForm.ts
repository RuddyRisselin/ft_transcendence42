import { state } from "../../state";
import { updateUser, deleteUser } from "../../services/userService";
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


    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete account";
    deleteBtn.className = "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-auto mt-2";
    deleteBtn.onclick = async () => {
        try {
            const value = confirm("Are you sure ?");
            if (value)
            {
                const success = await deleteUser(username.value);
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
    container.append(title, avatar, username, email, saveBtn, deleteBtn);
    return container;
}
