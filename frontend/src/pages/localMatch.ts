import { state } from "../state";
import { navigateTo } from "../router";
import { loginWithoutSession } from "../services/auth"; // ✅ Connexion temporaire du Joueur 2
import { getUsers } from "../services/userService";
import { translateText } from "../translate";

export default async function LocalMatch(): Promise<HTMLElement> {
     /*          TRANSLATE TAB       */
     const textToTranslate = [
        "Match Local 1v1",
        "Se connecter",
        "Match à durée limitée",
        "Match en nombre de points",
        "min",
        "points",
        "Commencer la partie",
        "Veuillez entrer le mot de passe du Joueur 2.",
        "Connexion réussie pour",
        "Échec de l'authentification. Vérifiez le mot de passe.",
        "Mot de passe du Joueur 2"
    ];
    const [
        translatedMatch1v1,
        translatedConnexion,
        translatedMatchTime,
        translatedMatchPoint,
        translatedMin,
        translatedPoint,
        translatedStartGame,
        translatedAlertEnterPwd,
        translatedAlertSuccess,
        translatedAlertFailed,
        translatedPHpwdPlayer

    ] = await Promise.all(textToTranslate.map(text => translateText(text)));

    if (!state.user) {
        navigateTo(new Event("click"), "/login");
        return document.createElement("div");
    }

    // ✅ NOUVEAU: Stocker la page actuelle dans localStorage pour les redirections
    localStorage.setItem('currentPage', 'local-match');

    console.log("🔍 Chargement des utilisateurs...");
    const users = await getUsers();
    console.log("✅ Utilisateurs récupérés :", users);

    const container = document.createElement("div");
    container.className = "flex flex-col items-center min-h-screen bg-gradient-to-r from-blue-950 via-blue-700 to-blue-950 text-white p-8 space-y-6";

    const title = document.createElement("h1");
    title.innerText = "🏓 Match Local 1v1";
    title.className = "text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-100 text-center";

    // Section principale avec effet glassmorphism
    const mainSection = document.createElement("div");
    mainSection.className = "w-full max-w-xl bg-black bg-opacity-40 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-blue-500/30 flex flex-col items-center space-y-6";

    // ✅ Sélection du Joueur 2 (liste déroulante)
    const playerSelectionContainer = document.createElement("div");
    playerSelectionContainer.className = "w-full space-y-3";
    
    const playerSelectLabel = document.createElement("div");
    playerSelectLabel.className = "text-xl font-medium text-blue-200";
    playerSelectLabel.innerText = "Sélectionner votre adversaire";
    
    const player2Select = document.createElement("select");
    player2Select.className = "w-full px-4 py-3 rounded-lg text-white shadow-md border-2 border-blue-600 bg-blue-900/70 focus:border-blue-400 focus:ring focus:ring-blue-400/50 transition-all";

    users.forEach(user => {
        if (user.username !== state.user.username) {
            const option: HTMLOptionElement = document.createElement("option");
            option.value = user.username;
            option.innerHTML = user.username;
            player2Select.appendChild(option);
        }
    });

    playerSelectionContainer.append(playerSelectLabel, player2Select);

    // ✅ Champ de mot de passe pour le Joueur 2
    const passwordContainer = document.createElement("div");
    passwordContainer.className = "w-full space-y-3 hidden";
    
    const passwordLabel = document.createElement("div");
    passwordLabel.className = "text-xl font-medium text-blue-200";
    passwordLabel.innerText = "Mot de passe de l'adversaire";
    
    const player2Password = document.createElement("input");
    player2Password.type = "password";
    player2Password.placeholder = "Entrez le mot de passe...";
    player2Password.className = "w-full px-4 py-3 rounded-lg text-white shadow-md border-2 border-blue-600 bg-blue-900/70 focus:border-blue-400 focus:ring focus:ring-blue-400/50 transition-all placeholder-blue-300/70";

    passwordContainer.append(passwordLabel, player2Password);

    // ✅ Bouton pour valider la connexion du Joueur 2
    const connectButton = document.createElement("button");
    connectButton.innerText = "🔑 Connecter l'adversaire";
    connectButton.className = "w-full px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 font-bold text-lg hidden";

    // ✅ Section des paramètres du match (cachée au départ)
    const matchSettingsContainer = document.createElement("div");
    matchSettingsContainer.className = "w-full space-y-6 hidden"; // Caché tant que le Joueur 2 n'est pas connecté

    // ✅ Sélection du mode de jeu
    const modeContainer = document.createElement("div");
    modeContainer.className = "w-full space-y-3";
    
    const modeLabel = document.createElement("div");
    modeLabel.className = "text-xl font-medium text-blue-200";
    modeLabel.innerText = "Mode de jeu";
    
    const modeSelect = document.createElement("select");
    modeSelect.className = "w-full px-4 py-3 rounded-lg text-white shadow-md border-2 border-blue-600 bg-blue-900/70 focus:border-blue-400 focus:ring focus:ring-blue-400/50 transition-all";

    const optionTime: HTMLOptionElement = document.createElement("option");
    optionTime.value = "time";
    optionTime.innerHTML = "⏳ " + translatedMatchTime;

    const optionPoints: HTMLOptionElement = document.createElement("option");
    optionPoints.value = "points";
    optionPoints.innerHTML = "🏆 " + translatedMatchPoint;

    modeSelect.append(optionTime, optionPoints);
    modeContainer.append(modeLabel, modeSelect);

    // ✅ Options de durée
    const timeContainer = document.createElement("div");
    timeContainer.className = "w-full space-y-3";
    
    const timeLabel = document.createElement("div");
    timeLabel.className = "text-xl font-medium text-blue-200";
    timeLabel.innerText = "Durée du match";
    
    const timeOptions = document.createElement("select");
    timeOptions.className = "w-full px-4 py-3 rounded-lg text-white shadow-md border-2 border-blue-600 bg-blue-900/70 focus:border-blue-400 focus:ring focus:ring-blue-400/50 transition-all";

    [120, 300, 600].forEach(time => {
        const option: HTMLOptionElement = document.createElement("option");
        option.value = String(time);
        option.innerText = `⏳ ${Math.floor(time / 60)} min ${time % 60 ? (time % 60) + ' sec' : ''}`;
        timeOptions.appendChild(option);
    });
    
    timeContainer.append(timeLabel, timeOptions);

    // ✅ Options de points
    const pointsContainer = document.createElement("div");
    pointsContainer.className = "w-full space-y-3 hidden";
    
    const pointsLabel = document.createElement("div");
    pointsLabel.className = "text-xl font-medium text-blue-200";
    pointsLabel.innerText = "Nombre de points à atteindre";
    
    const pointsOptions = document.createElement("select");
    pointsOptions.className = "w-full px-4 py-3 rounded-lg text-white shadow-md border-2 border-blue-600 bg-blue-900/70 focus:border-blue-400 focus:ring focus:ring-blue-400/50 transition-all";

    [5, 10, 15].forEach(points => {
        const option: HTMLOptionElement = document.createElement("option");
        option.value = String(points);
        option.innerHTML = `🎯 ${points} ${translatedPoint}`;
        pointsOptions.appendChild(option);
    });
    
    pointsContainer.append(pointsLabel, pointsOptions);

    // ✅ Bouton pour commencer la partie
    const startGameButton = document.createElement("button");
    startGameButton.innerText = "🚀 Commencer la partie";
    startGameButton.className = "w-full px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 font-bold text-xl";

    // ✅ Affichage dynamique des options de match
    function updateMatchOptions() {
        if (modeSelect.value === "time") {
            timeContainer.classList.remove("hidden");
            pointsContainer.classList.add("hidden");
        } else {
            timeContainer.classList.add("hidden");
            pointsContainer.classList.remove("hidden");
        }
    }
    modeSelect.addEventListener("change", updateMatchOptions);
    updateMatchOptions();

    // ✅ Affichage du mot de passe et du bouton après la sélection d'un joueur
    function showLoginFields() {
        console.log(`🎯 Joueur 2 sélectionné : ${player2Select.value}`);
        passwordContainer.classList.remove("hidden");
        connectButton.classList.remove("hidden");
    }

    player2Select.addEventListener("change", showLoginFields);
    if (player2Select.value) {
        showLoginFields();
    }

    // ✅ Connexion temporaire du Joueur 2
    connectButton.onclick = async () => {
        const player2Username: string = player2Select.value;
        const password: string = player2Password.value.trim();

        if (!password) {
            alert( translatedAlertEnterPwd);
            return;
        }

        console.log(`🔑 Tentative de connexion temporaire pour ${player2Username}...`);

        try {
            const player2Auth = await loginWithoutSession(player2Username, password);
            console.log(`✅ Connexion réussie pour ${player2Username}`, player2Auth);

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
            playerSelectionContainer.classList.add("hidden");
            passwordContainer.classList.add("hidden");
            connectButton.classList.add("hidden");

            // ✅ Afficher les paramètres du match et le bouton de démarrage
            matchSettingsContainer.classList.remove("hidden");
        } catch (error) {
            console.error("❌ Échec de l'authentification :", error);
            alert("❌ " + translatedAlertFailed);
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

    // Assembler tous les éléments
    matchSettingsContainer.append(modeContainer, timeContainer, pointsContainer, startGameButton);
    mainSection.append(playerSelectionContainer, passwordContainer, connectButton, matchSettingsContainer);
    container.append(title, mainSection);
    
    return container;
}
