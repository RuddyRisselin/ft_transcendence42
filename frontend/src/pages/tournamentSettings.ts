import { state } from "../state";
import { navigateTo } from "../router";
import { getUsers } from "../services/userService";
import { loginWithoutSession } from "../services/auth";
import { translateText } from "../translate";

export default async function TournamentSettings(): Promise<HTMLElement> {
    
    /*          TRANSLATE TAB       */
    const textToTranslate = [
        "Paramètres du Tournoi",
        "Nombre de joueurs :",
        "joueurs",
        "Suivant",
        "Pseudo du Joueur",
        "Mot de Passe",
        "Se connecter",
        "connecté",
        "Match à durée limitée",
        "Match en nombre de points",
        "min",
        "points",
        "Lancer le tournoi",
        "Connexion échouée !"
    ];
    const [
        translatedParam,
        translatedNb,
        translatedPlayer,
        translatedNext,
        translatedPseudo,
        translatedPwd,
        translatedConnexion,
        translatedConnected,
        translatedMatchTime,
        translatedMatchPoint,
        translatedMin,
        translatedPoint,
        translatedStartTournament,
        translatedFailedConnexion
    ] = await Promise.all(textToTranslate.map(text => translateText(text)));
    
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
    title.innerHTML = "🏆 " + translatedParam;
    title.className = "text-4xl font-bold text-yellow-400";

    // ✅ Étape 1 : Sélection du nombre de joueurs
    const step1 = document.createElement("div");
    step1.className = "space-y-4";

    const playersCountLabel = document.createElement("p");
    playersCountLabel.innerHTML = "👥 " + translatedNb;
    playersCountLabel.className = "text-xl";

    const playersCountSelect = document.createElement("select");
    playersCountSelect.className = "px-4 py-2 rounded-lg text-black text-center shadow-md border-2 border-yellow-500 bg-white w-64";
    [4, 8, 16].forEach(count => {
        const option = document.createElement("option");
        option.value = String(count);
        option.innerHTML = `${count} ` + translatedPlayer;
        playersCountSelect.appendChild(option);
    });

    const nextStepButton1 = document.createElement("button");
    nextStepButton1.innerHTML = "➡️ " +  translatedNext;
    nextStepButton1.className = "px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 mt-4";

    step1.append(playersCountLabel, playersCountSelect, nextStepButton1);

    // ✅ Étape 2 : Connexion des joueurs
    const step2 = document.createElement("div");
    step2.className = "space-y-4 hidden";

    const playersListContainer = document.createElement("div");
    playersListContainer.className = "space-y-4";

    let connectedPlayers = new Set<string>();
    connectedPlayers.add(state.user.username); // ✅ Créateur automatiquement inclus

    async function generatePlayerInputs() {
        playersListContainer.innerHTML = "";
        const numPlayers = parseInt(playersCountSelect.value) - 1;

        for (let i = 0; i < numPlayers; i++) {
            const playerContainer = document.createElement("div");
            playerContainer.className = "flex flex-col space-y-2";

            const usernameInput = document.createElement("input");
            usernameInput.type = "text";
            usernameInput.placeholder = `${translatedPseudo} ${i + 2}`;
            usernameInput.className = "px-4 py-2 rounded-lg text-black text-center shadow-md border-2 border-gray-400 w-64";

            const passwordInput = document.createElement("input");
            passwordInput.type = "password";
            passwordInput.placeholder = translatedPwd;
            passwordInput.className = "px-4 py-2 rounded-lg text-black text-center shadow-md border-2 border-gray-400 w-64";

            const loginButton = document.createElement("button");
            loginButton.innerHTML = "🔑 " +  translatedConnexion;
            loginButton.className = "px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105";
            loginButton.onclick = async () => {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();

                if (!username || !password) {
                    alert("⚠️ Remplissez les champs !");
                    return;
                }

                if (connectedPlayers.has(username)) {
                    alert("⚠️ Ce joueur est déjà connecté !");
                    return;
                }

                try {
                    await loginWithoutSession(username, password);
                    console.log(`✅ Connexion réussie pour ${username}`);
                    loginButton.innerHTML = `✅ ${username} ` + translatedConnected;
                    loginButton.disabled = true;
                    usernameInput.disabled = true;
                    passwordInput.disabled = true;
                    connectedPlayers.add(username);
                    updateNextStepButtonVisibility();
                } catch (error) {
                    alert("❌ " + translatedFailedConnexion);
                }
            };

            playerContainer.append(usernameInput, passwordInput, loginButton);
            playersListContainer.appendChild(playerContainer);
        }
    }

    playersCountSelect.addEventListener("change", generatePlayerInputs);
    generatePlayerInputs();

    const nextStepButton2 = document.createElement("button");
    nextStepButton2.innerHTML = "➡️ " + translatedNext;
    nextStepButton2.className = "px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 mt-4 hidden";

    function updateNextStepButtonVisibility() {
        if (connectedPlayers.size === parseInt(playersCountSelect.value)) {
            nextStepButton2.classList.remove("hidden");
        }
    }

    step2.append(playersListContainer, nextStepButton2);

    nextStepButton1.onclick = () => {
        step1.classList.add("hidden");
        step2.classList.remove("hidden");
        generatePlayerInputs();
    };

    // ✅ Étape 3 : Paramètres du tournoi
    const step3 = document.createElement("div");
    step3.className = "space-y-4 hidden";

    const modeSelect = document.createElement("select");
    modeSelect.className = "px-4 py-2 rounded-lg text-black text-center shadow-md border-2 border-blue-400 bg-white w-64";
    
    const optionTime = document.createElement("option");
    optionTime.value = "time";
    optionTime.innerHTML = "⏳ " +  translatedMatchTime;

    const optionPoints = document.createElement("option");
    optionPoints.value = "points";
    optionPoints.innerHTML = "🏆 " + translatedMatchPoint;

    modeSelect.append(optionTime, optionPoints);

    const targetSelect = document.createElement("select");
    targetSelect.className = "px-4 py-2 rounded-lg text-black shadow-md border-2 border-red-400 bg-white w-64";

    function updateTargetOptions() {
        targetSelect.innerHTML = "";
        const options = modeSelect.value === "time" ? [120, 300, 600] : [5, 10, 15];
        options.forEach(async value => {
            const option = document.createElement("option");
            option.value = String(value);
            option.innerHTML = modeSelect.value === "time" ? `${value / 60} ${translatedMin}` : `${value} ${translatedPoint}`;
            targetSelect.appendChild(option);
        });
    }
    
    modeSelect.addEventListener("change", updateTargetOptions);
    updateTargetOptions();

    const startTournamentButton = document.createElement("button");
    startTournamentButton.innerHTML = "🚀 " + translatedStartTournament;
    startTournamentButton.className = "mt-6 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105";

    startTournamentButton.onclick = () => {
        state.tournament = {
            players: Array.from(connectedPlayers),
			matchs: Array.from(connectedPlayers).length - 1,
            mode: modeSelect.value as "time" | "points",
            target: parseInt(targetSelect.value),
            bracket: [],
        };
        console.log("✅ Tournoi configuré :", state.tournament);
        navigateTo(new Event("click"), "/tournament-bracket");
    };

    step3.append(modeSelect, targetSelect, startTournamentButton);
    nextStepButton2.onclick = () => {
        step2.classList.add("hidden");
        step3.classList.remove("hidden");
    };

    container.append(title, step1, step2, step3);
    return container;
}
