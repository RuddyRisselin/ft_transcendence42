import { login } from "../services/auth";
import { navigateTo } from "../router";

export default function Login() {
    // 🔴 Suppression immédiate de la sidebar si elle est présente
    const existingSidebar = document.querySelector(".sidebar");
    if (existingSidebar) {
        existingSidebar.remove();
        console.log("✅ Sidebar supprimée sur la page de connexion.");
    }

    const form = document.createElement("form");
    form.className = "flex flex-col items-center p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 mx-auto mt-20 border border-gray-700";

    const title = document.createElement("h2");
    title.innerText = "Connexion";
    title.className = "text-3xl font-bold mb-4 text-center text-blue-400";

    const username = document.createElement("input");
    username.type = "text";
    username.placeholder = "Nom d'utilisateur";
    username.className = "input-style";

    const password = document.createElement("input");
    password.type = "password";
    password.placeholder = "Mot de passe";
    password.className = "input-style";

    const errorMsg = document.createElement("p");
    errorMsg.className = "text-red-500 text-sm mt-2 hidden";

    const submit = document.createElement("button");
    submit.innerText = "Se connecter";
    submit.className = "btn-primary";
    submit.onclick = async (e) => {
        e.preventDefault();
        errorMsg.classList.add("hidden");

        try {
            await login(username.value, password.value, true);
            navigateTo(new Event("click"), "/dashboard");
        } catch (error) {
            errorMsg.innerText = "Erreur : " + error.message;
            errorMsg.classList.remove("hidden");
        }
    };

    const registerLink = document.createElement("a");
    registerLink.innerText = "Pas encore inscrit ?";
    registerLink.className = "text-blue-400 hover:underline mt-3 cursor-pointer";
    registerLink.onclick = (e) => {
        e.preventDefault();
        navigateTo(new Event("click"), "/register");
    };

    form.append(title, username, password, errorMsg, submit, registerLink);
    return form;
}
