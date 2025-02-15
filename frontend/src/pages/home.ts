import { navigateTo } from "../router";

export default function Home() {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white text-center p-6";

    // Titre
    const title = document.createElement("h1");
    title.className = "text-5xl font-bold mb-4";
    title.innerText = "Bienvenue sur Ft Transcendence !";

    // Description
    const description = document.createElement("p");
    description.className = "text-lg text-gray-300 mb-6 max-w-2xl";
    description.innerText = "Rejoignez une aventure épique où vous affrontez vos amis dans des tournois de Pong compétitifs ! Inscrivez-vous dès maintenant pour commencer.";

    // Boutons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "flex space-x-4";

    // Bouton Connexion
    const loginButton = document.createElement("button");
    loginButton.className = "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded";
    loginButton.innerText = "Se Connecter";
    loginButton.onclick = (e) => navigateTo(e, "/login");

    // Bouton Inscription
    const registerButton = document.createElement("button");
    registerButton.className = "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded";
    registerButton.innerText = "S'inscrire";
    registerButton.onclick = (e) => navigateTo(e, "/register");

    // Ajout des éléments au DOM
    buttonContainer.appendChild(loginButton);
    buttonContainer.appendChild(registerButton);
    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(buttonContainer);

    return container;
}
