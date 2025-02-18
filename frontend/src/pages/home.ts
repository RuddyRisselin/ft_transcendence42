import { state } from "../state";
import { navigateTo } from "../router";

export default function Home(): HTMLElement {
    console.log("🏠 Page Home affichée.");

    // ✅ Vérification : si l'utilisateur est connecté, on le redirige immédiatement
    if (state.user) {
        navigateTo(new Event("click"), "/dashboard");
        return document.createElement("div");
    }
    else
    {
        navigateTo(new Event("click"), "/login");
    }

    const container = document.createElement("div");
    container.className = "flex flex-col items-center min-h-screen bg-black text-white p-8";

    const title = document.createElement("h1");
    title.innerText = "🚀 Bienvenue sur Ft Transcendence";
    title.className = "text-4xl font-bold text-purple-400";

    const loginButton = document.createElement("button");
    loginButton.innerText = "🔑 Se Connecter";
    loginButton.className = "mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md transition-all";
    loginButton.onclick = (e) => navigateTo(e, "/login");

    container.append(title, loginButton);

    return container;
}
