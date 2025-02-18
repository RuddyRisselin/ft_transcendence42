export const state = {
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || null,
    socket: null as WebSocket | null,
};
