import { state } from "../../state";
import { updateUser, deleteUser, anonymizeUser, getQrcode } from "../../services/userService";
import { logout } from "../../services/auth";

export default function ProfileForm(): HTMLElement {
    const container = document.createElement("div");
    container.className = "flex flex-col items-start p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 border border-gray-700";

    const title = document.createElement("h2");
    title.innerText = "Profile Management";
    title.className = "text-3xl font-bold mb-4 text-left text-blue-400";

    const avatar = document.createElement("img");
    avatar.src = state.user.avatar || "default-avatar.png";
    avatar.className = "w-24 h-24 rounded-full border-2 border-blue-400 mb-3";

    const username = document.createElement("input");
    username.type = "text";
    username.value = state.user.username;
    username.className = "input-style";

    const email = document.createElement("input");
    email.type = "email";
    email.value = state.user.email;
    email.className = "input-style";

    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Save";
    saveBtn.className = "btn-primary";
    saveBtn.onclick = async () => {
        const success = await updateUser(username.value, email.value);
        if (success) {
            state.user.username = username.value;
            state.user.email = email.value;
            alert("Profile updated!");
        } else {
            alert("Error updating profile");
        }
    };


    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete account";
    deleteBtn.className = "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-auto mt-2";
    deleteBtn.onclick = async () => {
        try {
            const value = confirm("Are you sure ?");
            if (value)
            {
                const success = await deleteUser(state.user.username);
                if (success) {
                    alert("Profil deleted!");
                    await logout();
                } else {
                    alert("Error delete profil");
                }
            }
            } catch (error) {
                console.error("❌ Erreur inattendue :", error);
                alert("Une erreur est survenue !");
            }
    };

    const anonymizeBtn = document.createElement("button");
    let token = state.token;
    if (!token)
        token = "";
    if (state.user.anonymize === 0)
        anonymizeBtn.innerText = "Going private";
    else
        anonymizeBtn.innerText = "Going public";
    anonymizeBtn.className = "bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mx-auto mt-2";
    anonymizeBtn.onclick = async () => {
        try {
            const value = confirm("Are you sure ?");
            if (value)
            {
                const success = await anonymizeUser(state.user.username, token);
                if (success && anonymizeBtn.textContent === "Going private") {
                    alert("Your profil is private!");
                    anonymizeBtn.innerText = "Going public";
                }
                else if (success && anonymizeBtn.textContent === "Going public")
                {
                    alert("Your profil is public!");
                    anonymizeBtn.innerText = "Going private";
                }
                else
                    alert("Error request profil");
                window.location.reload();
            }
            } catch (error) {
                console.error("❌ Erreur inattendue :", error);
                alert("Une erreur est survenue !");
            }
    };

    const btnQRCode = document.createElement("button");
    btnQRCode.innerHTML = "QRCODE";
    const image = document.createElement("img");
    btnQRCode.onclick = async () => {
        try{
            image.style.position = "absolute";
            image.style.top = "50%";
            image.style.left = "50%";
            image.style.width = " 200px";
            image.style.zIndex = "40";
            getQrcode(state.user.id, state.user.username).then((data) =>{
                console.log("STATE ", state);
                if (data)
                    image.src = data;
                container.append(image);
            });
            console.log(image.src);
        }
        catch (error) {
            console.error("❌ Erreur QRcode :", error);
            alert("Erreur QRcode");
        }
        // const image = document.createElement("img");
    };


    // const image = document.createElement("img");
    //     fetch("http://localhost:3000/2FA/generate-2fa", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ userId: state.user.id, username: state.user.username })
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.qrCode) {
    //             image.src = data.qrCode; // Utilise la valeur base64 du QR Code
    //         } else {
    //             console.error("QR Code non reçu du serveur");
    //         }
    //     })
    //     .catch(error => console.error("Erreur lors de la récupération du QR Code:", error));
    
    



    container.append(title, avatar, username, email, saveBtn, anonymizeBtn, deleteBtn, btnQRCode, image);
    return container;
}
