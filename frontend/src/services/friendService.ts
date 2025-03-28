import { state } from "../state";

export async function getFriends() {
    try {
        const response = await fetch(`http://localhost:3000/users/${state.user.id}/friends`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des amis");
        return await response.json();
    } catch (error) {
        console.error("❌ Erreur:", error);
        return [];
    }
}

export async function getFriendRequests() {
    try {
        const response = await fetch(`http://localhost:3000/users/${state.user.id}/friend-requests`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des demandes d'amitié");
        return await response.json();
    } catch (error) {
        console.error("❌ Erreur:", error);
        return [];
    }
}

export async function addFriend(friendId: number) {
    try {
        const response = await fetch(`http://localhost:3000/users/${state.user.id}/friends/${friendId}`, {
            method: "POST"
        });
        if (!response.ok) throw new Error("Erreur lors de l'envoi de la demande d'amitié");
        return await response.json();
    } catch (error) {
        console.error("❌ Erreur:", error);
        return null;
    }
}

export async function removeFriend(friendId: number) {
    try {
        const response = await fetch(`http://localhost:3000/users/${state.user.id}/friends/${friendId}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Erreur lors de la suppression de l'ami");
        return await response.json();
    } catch (error) {
        console.error("❌ Erreur:", error);
        return null;
    }
}

export async function acceptFriendRequest(friendId: number) {
    try {
        const response = await fetch(`http://localhost:3000/users/${state.user.id}/friends/${friendId}/accept`, {
            method: "PATCH"
        });
        if (!response.ok) throw new Error("Erreur lors de l'acceptation de la demande d'amitié");
        return await response.json();
    } catch (error) {
        console.error("❌ Erreur:", error);
        return null;
    }
}

export async function rejectFriendRequest(friendId: number) {
    try {
        const response = await fetch(`http://localhost:3000/users/${state.user.id}/friends/${friendId}/reject`, {
            method: "PATCH"
        });
        if (!response.ok) throw new Error("Erreur lors du rejet de la demande d'amitié");
        return await response.json();
    } catch (error) {
        console.error("❌ Erreur:", error);
        return null;
    }
} 