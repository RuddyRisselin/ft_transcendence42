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
    password.placeholder = (localStorage.getItem("language") === "en") ? "Password" : translatedPwdInput;
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

    const languageDiv = document.createElement("div");
    languageDiv.className = "mt-auto flex p-3 flex-row flex-wrap justify-around items-center";
    // languageDiv.className = "mt-auto mb-4 mx-4 p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center rounded-lg transition duration-200 group border border-red-500/20"
    const btnEN = document.createElement("button");
    const btnES = document.createElement("button");
    const btnFR = document.createElement("button");
    btnEN.innerHTML = "🇺🇸";
    btnEN.className = "px-1 m-1 border-2 border-red-500/75 rounded hover:bg-red-700 duration-500";
    
    btnES.innerHTML = "🇪🇦";
    btnES.className = "px-1 m-1 border-2 border-yellow-500/75 rounded hover:bg-yellow-700 duration-500";
    
    btnFR.innerHTML = "🇨🇵";
    btnFR.className = "px-1 m-1 border-2 border-blue-500/75 rounded hover:bg-blue-700 duration-500";
    languageDiv.appendChild(btnEN);
    languageDiv.appendChild(btnES);
    languageDiv.appendChild(btnFR);

    btnEN.onclick = async () => {
        const langue = "en";
        localStorage.setItem("language", langue);
        window.location.reload();
    };
    btnES.onclick = async () => {
        const langue = "es";
        localStorage.setItem("language", langue);
        window.location.reload();
    };
    btnFR.onclick = async () => {
        const langue = "fr";
        localStorage.setItem("language", langue);
        window.location.reload();
    };

    form.append(title, username, password, errorMsg, submit, registerLink, languageDiv);
    return form;
}
