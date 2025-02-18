export const gameState = {
    user: null as { id: number; username: string } | null, 
    match: null as { matchId: string; player1: number; player2: number } | null,

    setUser(user: { id: number; username: string }) {
        this.user = user;
    },

    clearUser() {
        this.user = null;
    },

    setMatch(match: { matchId: string; player1: number; player2: number }) {
		if (!match || !match.matchId) {
			console.error("❌ Tentative d'enregistrer un match invalide :", match);
			return;
		}
		this.match = match;
		localStorage.setItem("match", JSON.stringify(match));
		console.log("✅ Match sauvegardé :", this.match);
	},	
	loadMatch() {
		const storedMatch = localStorage.getItem("match");
	
		if (!storedMatch || storedMatch === "undefined") {
			console.warn("⚠️ Aucun match valide trouvé dans localStorage.");
			this.match = null;
			return;
		}
	
		try {
			this.match = JSON.parse(storedMatch);
			console.log("✅ Match chargé depuis localStorage :", this.match);
		} catch (error) {
			console.error("❌ Erreur de parsing JSON :", error);
			this.match = null;
		}
	},

    clearMatch() {
        this.match = null;
    },

    loadFromStorage() {
        const storedUser = localStorage.getItem("gameUser");
        if (storedUser) {
            this.user = JSON.parse(storedUser);
        }
        const storedMatch = localStorage.getItem("gameMatch");
        if (storedMatch) {
            this.match = JSON.parse(storedMatch);
        }
    },

    saveToStorage() {
        if (this.user) {
            localStorage.setItem("gameUser", JSON.stringify(this.user));
        }
        if (this.match) {
            localStorage.setItem("gameMatch", JSON.stringify(this.match));
        }
    }
};

gameState.loadFromStorage();
