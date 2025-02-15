export async function getUsers() {
    const response = await fetch("/api/users");
    return await response.json();
}

export async function updateUser(username: string, email: string) {
    const response = await fetch("/api/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
    });

    return response.ok;
}
