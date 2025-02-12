import Layout from "../components/layout";
import { navigateTo } from "../router";

export default function Home() {
  const container = document.createElement("div");
  container.className = "flex flex-col items-center justify-center min-h-screen p-4 text-center";

  const title = document.createElement("h1");
  title.className = "text-4xl font-bold mb-4";
  title.innerText = "Bienvenue sur Ft Transcendence !";

  const description = document.createElement("p");
description.className = "text-lg text-gray-300 mb-4 text-center";

const apiResponse = document.createElement("p");
apiResponse.className = "text-md text-green-300 mt-4";
apiResponse.innerText = "Chargement de la connexion...";

fetch("/api/test")
    .then(response => response.json())
    .then(data => {
        apiResponse.innerText = `Réponse du backend : ${data.message}`;
    })
    .catch(error => {
        apiResponse.innerText = "Erreur de connexion au backend !";
        console.error("Erreur API :", error);
    });

  const playButton = document.createElement("button");
  playButton.className = "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300";
  playButton.innerText = "Jouer Maintenant";
  playButton.onclick = (event) => navigateTo(event, "/game");

  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(playButton);
  container.appendChild(apiResponse);

  return Layout(container);
}
