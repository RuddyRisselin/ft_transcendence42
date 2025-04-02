import { state } from "../../state";
import { updatePhotoUser, updateUser, deleteUser, anonymizeUser, getQrcode } from "../../services/userService";
import { uploadFile } from "../../services/uploadFile";
import { logout } from "../../services/auth";
import { displayModalQRCode } from "../displayModalQRCode";
import { translateText } from "../../translate";

export default function ProfileForm(): HTMLDivElement {
    
    const container: HTMLDivElement = document.createElement("div");
    container.className = "flex flex-col items-center p-6 bg-gray-800 text-white rounded-xl shadow-lg w-full h-full test";
    
    const title: HTMLHeadingElement = document.createElement("h2");
    translateText("Gestion de profil").then((translated) => {
        title.innerHTML = translated;
    })
    title.className = "text-2xl text-blue-400 font-bold mb-6";
    
    const divAvatar: HTMLDivElement = document.createElement("div");
    divAvatar.className = "flex flex-col items-center justify-center w-full mb-6";
    
    const avatar: HTMLImageElement = document.createElement("img");
    avatar.src = "http://localhost:3000/images/" + state.user.avatar || "http://localhost:3000/images/default.jpg";
    avatar.className = "w-24 h-24 rounded-full border-2 border-blue-400 mb-4";
    divAvatar.appendChild(avatar);
    
    const btnRequestPhoto: HTMLButtonElement = document.createElement("button");
    translateText("Changer de photo").then((translated) => {
        btnRequestPhoto.innerHTML = translated;
    })
    btnRequestPhoto.className = "bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2 font-semibold text-sm";
    divAvatar.appendChild(btnRequestPhoto);
    
    const divUpdatePhoto: HTMLDivElement = document.createElement("div");
    divUpdatePhoto.className = "hidden w-full";
    const form: HTMLFormElement = document.createElement("form");
    form.method = "POST";
    form.enctype = "multipart/form-data";
    form.className = "w-full";
    const labelFile: HTMLLabelElement = document.createElement("label");
    translateText("Choisir la photo").then((translated) => {
        labelFile.innerHTML = translated;
    })
    labelFile.className = "mb-3 text-sm";
    const inputFile: HTMLInputElement = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = ".png, .jpeg, .jpg";
    inputFile.className = "text-sm w-full mb-2";
    const submitFile: HTMLButtonElement = document.createElement("button");
    translateText("Mettre la photo à jour").then((translated) => {
        submitFile.innerHTML = translated;
    })
    submitFile.className = "w-full bg-blue-500 hover:bg-blue-600 rounded py-2 px-4 text-sm";
    form.appendChild(labelFile);
    form.appendChild(inputFile);
    form.appendChild(submitFile);
    divUpdatePhoto.appendChild(form);
    divAvatar.appendChild(divUpdatePhoto);

    btnRequestPhoto.onclick = () => {
        if (state.user.anonymize)
            return alert("Your account must be in public !");
        divUpdatePhoto.classList.remove("hidden");
        btnRequestPhoto.classList.add("hidden");
    }
    submitFile.onclick = async (e) => {
        e.preventDefault();
        if (!inputFile.files?.length)
            return alert("Image not valid");

        const formData: FormData = new FormData();
        formData.append('image', inputFile.files[0]);
        console.log("FORMDATA : ", typeof formData);
        const response = await uploadFile(formData);
        if (!response || !response.filename)
            return alert("Echec du telechargement de l'image");
        const success = await updatePhotoUser(state.user.username, response.filename);
        if (success) {
            state.user.avatar = response.filename;
            localStorage.setItem("user", JSON.stringify(state.user));
            divUpdatePhoto.classList.add("hidden");
            btnRequestPhoto.classList.remove("hidden");
            window.location.reload();
        } else {
            alert("Error profile update impossible");
        }
    };

    // Conteneur pour les entrées de formulaire
    const formFieldsContainer = document.createElement("div");
    formFieldsContainer.className = "w-full space-y-4";

    const username = document.createElement("input");
    username.type = "text";
    username.value = state.user.username;
    username.className = "w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500";

    const email = document.createElement("input");
    email.type = "email";
    email.value = state.user.email;
    email.className = "w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500";

    formFieldsContainer.append(username, email);

    const anonymize = state.user.anonymize;
    if (anonymize === 1) {
        username.disabled = true;
        email.disabled = true;
    }

    // Conteneur de boutons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "w-full space-y-3 mt-4";

    const saveBtn = document.createElement("button");
    translateText("Mettre le profil à jour").then((translated) => {
        saveBtn.innerHTML = translated;
    })

    saveBtn.className = "w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded";
    if (anonymize === 1)
        saveBtn.disabled = true;
    saveBtn.onclick = async () => {
        let token = state.token;
        if (!token)
            token = "";
        const success = await updateUser(token, state.user.username, username.value, email.value);
        if (success) {
            state.user.username = username.value;
            state.user.email = email.value;
            alert("Profile updated!");
        } else {
            alert("Error profile update impossible");
        }
    };

    const anonymizeBtn = document.createElement("button");
    let token = state.token;
    if (!token)
        token = "";
    if (state.user.anonymize === 0)
    {
        translateText("Se mettre en privé").then((translated) => {
            anonymizeBtn.innerHTML = translated;
        })
    }
    else
    {
        translateText("Se mettre en publique").then((translated) => {
            anonymizeBtn.innerHTML = translated;
        })
    }
    anonymizeBtn.className = "w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded";
    anonymizeBtn.onclick = async () => {
        try {
            const value = confirm(await translateText("êtes-vous sûr ?"));
            if (value) {
                const success = await anonymizeUser(state.user.username, token);
                if (success && anonymizeBtn.textContent?.includes("priv")) {
                    translateText("Se mettre en publique").then((translated) => {
                        anonymizeBtn.innerHTML = translated;
                    })
                }
                else if (success && anonymizeBtn.textContent?.includes("bli")) {
                    translateText("Se mettre en privé").then((translated) => {
                        anonymizeBtn.innerHTML = translated;
                    })
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

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "Supprimer mon compte";
    translateText("Supprimer mon compte").then((translated) => {
        deleteBtn.innerHTML = translated;
    })
    deleteBtn.className = "w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded";
    deleteBtn.onclick = async () => {
        try {
            const value = confirm("Are you sure ?");
            if (value) {
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

    // Activation 2FA
    const div2FA = document.createElement("div");
    div2FA.className = "flex items-center justify-between w-full mt-4";
    
    const span2FA = document.createElement("span");
    translateText("Activer 2FA").then((translated) => {
        span2FA.innerHTML = translated;
    })
    span2FA.className = "text-sm";
    
    const toggleContainer = document.createElement("div");
    toggleContainer.className = "flex";

    const labelBtn = document.createElement("label");
    labelBtn.className = "switch";
    
    const btnQRCode = document.createElement("input");
    btnQRCode.type = "checkbox";
    if (state.user.is2FAEnabled == 1)
        btnQRCode.checked = true;
    
    const spanQrcode = document.createElement("span");
    spanQrcode.className = "slider round";
    
    labelBtn.appendChild(btnQRCode);
    labelBtn.appendChild(spanQrcode);
    toggleContainer.appendChild(labelBtn);
    
    div2FA.appendChild(span2FA);
    div2FA.appendChild(toggleContainer);

    displayModalQRCode(btnQRCode, state.user.id, state.user.username, container);

    buttonsContainer.append(saveBtn, anonymizeBtn, deleteBtn);
    container.append(title, divAvatar, formFieldsContainer, buttonsContainer, div2FA);
    return container;
}