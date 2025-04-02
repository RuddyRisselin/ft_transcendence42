


export async function translateText(text: string): Promise<string> 
{
    const target = localStorage.getItem("language");
    if (target == "fr" || !target)
        return text;

    const source = "fr";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        return data.responseData.translatedText || "Erreur de traduction";
    } catch (error) {
        console.error("Erreur lors de la traduction :", error);
        return "Erreur de traduction";
    }
}


export async function getQrcode(userId : number, username : string)
{
    return fetch("http://localhost:3000/2FA/generate-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId, username})
    })
    .then(response => response.json())
    .then(data => data.qrCode)
    .catch(error => console.error("Erreur lors de la récupération du QR Code:", error));    
}