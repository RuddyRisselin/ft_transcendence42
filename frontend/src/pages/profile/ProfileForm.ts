import { state } from "../../state";
import { updatePhotoUser, updateUser, deleteUser, anonymizeUser, getQrcode } from "../../services/userService";
import { uploadFile } from "../../services/uploadFile";
import { logout } from "../../services/auth";
import { displayModalQRCode } from "../displayModalQRCode";

export default function ProfileForm(): HTMLElement {
    const container = document.createElement("div");
    container.className = "flex flex-col items-start p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 border border-gray-700";

    const title: HTMLHeadingElement = document.createElement("h2");
    title.innerText = "Profile Management";
    title.className = "text-3xl font-bold mb-4 text-left text-blue-400";

    const divAvatar: HTMLDivElement = document.createElement("div");
    divAvatar.className = "flex flex-row justify-around items-center w-80";
    const avatar: HTMLImageElement = document.createElement("img");
    avatar.src = "http://localhost:3000/images/" + state.user.avatar || "http://localhost:3000/images/default.jpg";
    avatar.className = "w-24 h-24 rounded-full border-2 border-blue-400 mb-3 mr-3";
    divAvatar.appendChild(avatar);
    const btnRequestPhoto: HTMLButtonElement = document.createElement("button");
    btnRequestPhoto.innerHTML = "Change photo";
    btnRequestPhoto.className = "bg-black rounded-md border h-10 p-2 font-bold";
    divAvatar.appendChild(btnRequestPhoto);
    const divUpdatePhoto: HTMLDivElement = document.createElement("div");
    divUpdatePhoto.className = "hidden";
    const form: HTMLFormElement = document.createElement("form");
    form.method = "POST";
    form.enctype = "multipart/form-data";
    const labelFile: HTMLLabelElement = document.createElement("label");
    labelFile.innerHTML = "Choose profile picture : ";
    labelFile.className = "mb-3";
    const inputFile: HTMLInputElement = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = ".png, .jpeg, .jpg";
    const submitFile: HTMLButtonElement = document.createElement("button");
    submitFile.innerHTML = "Update picture";
    submitFile.className = "w-40 bg-blue-500 rounded mt-2 p-1";
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


    const username = document.createElement("input");
    username.type = "text";
    username.value = state.user.username;
    username.className = "input-style";

    const email = document.createElement("input");
    email.type = "email";
    email.value = state.user.email;
    email.className = "input-style";

    const anonymize = state.user.anonymize;
    if (anonymize === 1)
    {
        username.disabled = true;
        email.disabled = true;
    }
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Update profile";
    saveBtn.className = "btn-primary";
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
        } else {
            alert("Error profile update impossible");
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
                    await logout();
                } else {
                    alert("Error delete profil");
                }
            }
            } catch (error) {
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
                    anonymizeBtn.innerText = "Going public";
                }
                else if (success && anonymizeBtn.textContent === "Going public")
                    anonymizeBtn.innerText = "Going private";
                else
                    alert("Error request profil");
                window.location.reload();
            }
            } catch (error) {
                alert("Une erreur est survenue !");
            }
    };


    const div2FA = document.createElement("div");
    div2FA.classList.add("flex-box");
    const span2FA = document.createElement("span");
    span2FA.innerHTML = "Activate 2FA";
    span2FA.style.marginRight = "10px";
    div2FA.appendChild(span2FA);

    const labelBtn = document.createElement("label");
    labelBtn.classList.add("switch");
    labelBtn.classList.add("btnQrCode");
    const btnQRCode = document.createElement("input");
    btnQRCode.type = "checkbox";
    if (state.user.is2FAEnabled == 1)
        btnQRCode.checked = true;
    labelBtn.appendChild(btnQRCode);
    const spanQrcode = document.createElement("span");
    labelBtn.appendChild(spanQrcode);
    div2FA.appendChild(labelBtn);

    displayModalQRCode(btnQRCode, state.user.id, state.user.username, container);
    
    

    container.append(title, divAvatar, username, email, saveBtn, anonymizeBtn, deleteBtn, div2FA);
    return container;
}
