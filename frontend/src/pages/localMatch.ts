import { state } from "../state";
import { navigateTo } from "../router";
import { loginWithoutSession } from "../services/auth"; // ✅ Connexion temporaire du Joueur 2
import { getUsers } from "../services/userService";

export default async function LocalMatch(): Promise<HTMLElement> {
    if (!state.user) {
        navigateTo(new Event("click"), "/login");
        return document.createElement("div");
    }

    console.log("🔍 Chargement des utilisateurs...");
    const users = await getUsers();
    console.log("✅ Utilisateurs récupérés :", users);

    const container = document.createElement("div");
    container.className = "flex flex-col items-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8 space-y-6";

    const title = document.createElement("h1");
    title.innerText = "🌌 Match Local 1v1";
    title.className = "text-4xl font-bold text-purple-400 animate-pulse";

    // ✅ Sélection du Joueur 2 (liste déroulante)
    const player2Select = document.createElement("select");
    player2Select.className = "mt-4 px-4 py-2 rounded-lg text-black text-center shadow-md border-2 border-purple-500 bg-white w-64";

    users.forEach(user => {
        if (user.username !== state.user.username) {
            const option = document.createElement("option");
            option.value = user.username;
            option.innerText = user.username;
            player2Select.appendChild(option);
        }
    });

    // ✅ Champ de mot de passe pour le Joueur 2
    const player2Password = document.createElement("input");
    player2Password.type = "password";
    player2Password.placeholder = "Mot de passe du Joueur 2";
    player2Password.className = "mt-2 px-4 py-2 rounded-lg text-black text-center shadow-md border-2 border-gray-400 w-64 hidden";

    // ✅ Bouton pour valider la connexion du Joueur 2
    const connectButton = document.createElement("button");
    connectButton.innerText = "🔑 Se connecter";
    connectButton.className = "mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 hidden";

    // ✅ Section des paramètres du match (cachée au départ)
    const matchSettingsContainer = document.createElement("div");
    matchSettingsContainer.className = "mt-6 space-y-4 hidden"; // Caché tant que le Joueur 2 n'est pas connecté

    // ✅ Sélection du mode de jeu
    const modeSelect = document.createElement("select");
    modeSelect.className = "px-4 py-2 rounded-lg text-black text-center shadow-md border-2 border-blue-400 bg-white w-64";

    const optionTime = document.createElement("option");
    optionTime.value = "time";
    optionTime.innerText = "⏳ Match à durée limitée";

    const optionPoints = document.createElement("option");
    optionPoints.value = "points";
    optionPoints.innerText = "🏆 Match en nombre de points";

    modeSelect.append(optionTime, optionPoints);

    // ✅ Options de durée
    const timeOptions = document.createElement("select");
    timeOptions.className = "mt-2 px-4 py-2 rounded-lg text-black shadow-md border-2 border-yellow-400 bg-white w-64 hidden";

    [120, 300, 600].forEach(time => {
        const option = document.createElement("option");
        option.value = String(time);
        option.innerText = `⏳ ${time / 60} min`;
        timeOptions.appendChild(option);
    });

    // ✅ Options de points
    const pointsOptions = document.createElement("select");
    pointsOptions.className = "mt-2 px-4 py-2 rounded-lg text-black shadow-md border-2 border-red-400 bg-white w-64 hidden";

    [5, 10, 15].forEach(points => {
        const option = document.createElement("option");
        option.value = String(points);
        option.innerText = `🎯 ${points} points`;
        pointsOptions.appendChild(option);
    });

    // ✅ Bouton pour commencer la partie (caché par défaut)
    const startGameButton = document.createElement("button");
    startGameButton.innerText = "🚀 Commencer la partie";
    startGameButton.className = "mt-6 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 hidden";

    // ✅ Affichage dynamique des options de match
    function updateMatchOptions() {
        if (modeSelect.value === "time") {
            timeOptions.style.display = "block";
            pointsOptions.style.display = "none";
        } else {
            timeOptions.style.display = "none";
            pointsOptions.style.display = "block";
        }
    }
    modeSelect.addEventListener("change", updateMatchOptions);
    updateMatchOptions();

    // ✅ Affichage du mot de passe et du bouton après la sélection d’un joueur
    function showLoginFields() {
        console.log(`🎯 Joueur 2 sélectionné : ${player2Select.value}`);
        player2Password.classList.remove("hidden");
        connectButton.classList.remove("hidden");
    }

    player2Select.addEventListener("change", showLoginFields);
    if (player2Select.value) {
        showLoginFields();
    }

    // ✅ Connexion temporaire du Joueur 2
    connectButton.onclick = async () => {
        const player2Username = player2Select.value;
        const password = player2Password.value.trim();

        if (!password) {
            alert("⚠️ Veuillez entrer le mot de passe du Joueur 2.");
            return;
        }

        console.log(`🔑 Tentative de connexion temporaire pour ${player2Username}...`);

        try {
            const player2Auth = await loginWithoutSession(player2Username, password);
            console.log(`✅ Connexion réussie pour ${player2Username}`, player2Auth);
            alert(`✅ Connexion réussie pour ${player2Username} !`);

            // ✅ Stocker les infos du Joueur 2 sans écraser `state.user`
            if (!state.localMatch) {
				state.localMatch = {
					player1: state.user.username,
					player2: "",
					player2Auth: null,
					mode: "points",
					target: 10
				};
			}
			state.localMatch.player2Auth = player2Auth;
			

            // ✅ Cacher les champs après connexion
            connectButton.classList.add("hidden");
            player2Password.classList.add("hidden");

            // ✅ Afficher les paramètres du match et le bouton de démarrage
            matchSettingsContainer.classList.remove("hidden");
            startGameButton.classList.remove("hidden");

        } catch (error) {
            console.error("❌ Échec de l'authentification :", error);
            alert("❌ Échec de l'authentification. Vérifiez le mot de passe.");
        }
    };

    // ✅ Démarrer le match
    startGameButton.onclick = () => {
		if (!state.localMatch) {
			console.error("❌ Erreur : `state.localMatch` est null !");
			return;
		}
	
		state.localMatch.player1 = state.user.username;
		state.localMatch.player2 = player2Select.value;
		state.localMatch.mode = modeSelect.value as "time" | "points";
		state.localMatch.target = modeSelect.value === "time" ? parseInt(timeOptions.value) : parseInt(pointsOptions.value);
	
		navigateTo(new Event("click"), "/game-local");
	};
	

    // ✅ Ajout des paramètres de match au container après connexion
    matchSettingsContainer.append(modeSelect, timeOptions, pointsOptions, startGameButton);

    // ✅ Ajout des éléments au container
    container.append(title, player2Select, player2Password, connectButton, matchSettingsContainer);
    return container;
}
