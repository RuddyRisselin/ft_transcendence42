import { login } from "../services/auth";
import { navigateTo } from "../router";
import { translateText } from "../translate";

export default async function Login() {
    if (localStorage.getItem("user"))
        window.location.href = "/dashboard";
    // 🔴 Suppression immédiate de la sidebar si elle est présente
    const existingSidebar = document.querySelector(".sidebar");
    if (existingSidebar) {
        existingSidebar.remove();
        console.log("✅ Sidebar supprimée sur la page de connexion.");
    }

    const textsToTranslate = [
        "Connexion",
        "Nom d'utilisateur",
        "Mot de passe",
        "Se connecter",
        "Pas encore inscrit",
        "Erreur"
    ];

    const [
        translatedConnection,
        translatedUsernameInput, 
        translatedPwdInput, 
        translatedBtnConnection, 
        translatedNotRegistered,
        translatedOnlyError
    ] = await Promise.all(textsToTranslate.map(text => translateText(text)));


    const form = document.createElement("form");
    form.className = "flex flex-col items-center p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 mx-auto mt-20 border border-gray-700";

    const title = document.createElement("h2");
    title.innerHTML = translatedConnection;
    title.className = "text-3xl font-bold mb-4 text-center text-blue-400";

    const username = document.createElement("input");
    username.type = "text";
    username.placeholder = translatedUsernameInput;
    username.className = "input-style";

    const password = document.createElement("input");
    password.type = "password";
    password.placeholder = translatedPwdInput;
    password.className = "input-style";

    const errorMsg = document.createElement("p");
    errorMsg.className = "text-red-500 text-sm mt-2 hidden";

    const submit = document.createElement("button");
    submit.innerHTML = translatedBtnConnection;
    submit.className = "btn-primary";
    submit.onclick = async (e) => {
        e.preventDefault();
        errorMsg.classList.add("hidden");

        try {
            await login(username.value, password.value, true);
            navigateTo(new Event("click"), "/dashboard");
        } catch (error) {
            errorMsg.innerHTML = `${translatedOnlyError} : ${await translateText(error.message)}`;
            errorMsg.classList.remove("hidden");
        }
    };

    const registerLink = document.createElement("a");
    registerLink.innerHTML = translatedNotRegistered;
    registerLink.className = "text-blue-400 hover:underline mt-3 cursor-pointer";
    registerLink.onclick = (e) => {
        e.preventDefault();
        navigateTo(new Event("click"), "/register");
    };

    form.append(title, username, password, errorMsg, submit, registerLink);
    return form;
}
