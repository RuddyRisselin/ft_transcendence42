import Layout from "../components/layout";

export default function ApiTest() {
	const container = document.createElement("div");
	container.className = "flex flex-col items-center justify-center h-screen bg-gray-900 text-white";
  
	const title = document.createElement("h1");
	title.className = "text-3xl font-bold";
	title.innerText = "Test de l'API";
  
	const message = document.createElement("p");
	message.className = "mt-4 text-lg";
	message.innerText = "Chargement...";
  
	fetch("/api/test") // ✅ L'API est appelée ici
	  .then((response) => response.json())
	  .then((data) => {
		message.innerText = data.message; // ✅ Affiche la réponse de l'API
	  })
	  .catch((error) => {
		console.error("Erreur API:", error);
		message.innerText = "Erreur de connexion au backend.";
	  });
  
	container.appendChild(title);
	container.appendChild(message);
  
	return container;
  }