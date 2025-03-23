export async function uploadFile(formData: FormData) {
    try {
        const response = await fetch(`http://localhost:3000/uploadFile`, {
            method: "POST",
            body: formData,
        });
        if (!response.ok)
            throw new Error(`Erreur HTTP : ${response.status}`);
        const data = await response.json();
        console.log("DATA FILENAME : ", data.filename);
        return data;
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de l'utilisateur :", error);
        return false;
    }
}