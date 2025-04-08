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
			return;
		}
		this.match = match;
		localStorage.setItem("match", JSON.stringify(match));
	},	
	loadMatch() {
		const storedMatch: string | null = localStorage.getItem("match");
	
		if (!storedMatch || storedMatch === "undefined") {
			this.match = null;
			return;
		}
	
		try {
			this.match = JSON.parse(storedMatch);
		} catch (error) {
			console.error("❌ Erreur de parsing JSON :", error);
			this.match = null;
		}
	},

    clearMatch() {
        this.match = null;
    },

    loadFromStorage() {
        const storedUser: string | null = localStorage.getItem("gameUser");
        if (storedUser) {
            this.user = JSON.parse(storedUser);
        }
        const storedMatch: string | null = localStorage.getItem("gameMatch");
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
