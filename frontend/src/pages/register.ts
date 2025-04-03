import { register, login } from "../services/auth";
import { navigateTo } from "../router";
import { translateText } from "../translate";

export default async function Register() {
    const textsToTranslate = [
        "Inscription",
        "Nom d'utilisateur",
        "Email",
        "Mot de passe",
        "Confirmer mot de passe",
        "S'inscrire",
        "Déjà inscrit?"
    ];

    const [
        translatedRegister,
        translatedUsernameInput, 
        translatedEmailInput, 
        translatedPwdInput, 
        translatedConfirmPwdInput, 
        translatedBtnRegister, 
        translatedAlreadyRegistered
    ] = await Promise.all(textsToTranslate.map(text => translateText(text)));

    if (localStorage.getItem("user"))
        window.location.href = "/dashboard";
    const form = document.createElement("form");
    form.className = "flex flex-col items-center p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 mx-auto mt-20 border border-gray-700";

    const title = document.createElement("h2");
    title.innerHTML = translatedRegister;
    title.className = "text-3xl font-bold mb-4 text-center text-blue-400";

    const username = document.createElement("input");
    username.type = "text";
    username.placeholder = translatedUsernameInput;
    username.className = "input-style";

    const email = document.createElement("input");
    email.type = "email";
    email.placeholder = translatedEmailInput;
    email.className = "input-style";

    const password = document.createElement("input");
    password.type = "password";
    password.placeholder = translatedPwdInput;
    password.className = "input-style";

    const confirmPassword = document.createElement("input");
    confirmPassword.type = "password";
    confirmPassword.placeholder = translatedConfirmPwdInput;
    confirmPassword.className = "input-style";

    const errorMsg = document.createElement("p");
    errorMsg.className = "text-red-500 text-sm mt-2 hidden";

    const submit = document.createElement("button");
    submit.innerHTML = translatedBtnRegister;
    submit.className = "btn-primary";
    submit.onclick = async (e) => {
        e.preventDefault();
        errorMsg.classList.add("hidden");

        try {
            if (password.value != confirmPassword.value)
                throw new Error("Les mots de passe ne sont pas identiques");
            await register(username.value, email.value, password.value);
            await login(username.value, password.value, true);
            navigateTo(new Event("click"), "/dashboard");
            // window.location.href = "/login";
        } catch (error) {
            errorMsg.innerHTML = "Erreur : " + error.message;
            errorMsg.classList.remove("hidden");
        }
    };

    const loginLink = document.createElement("a");
    loginLink.innerHTML = translatedAlreadyRegistered;
    loginLink.className = "text-blue-400 hover:underline mt-3 cursor-pointer";
    loginLink.onclick = (e) => {
        e.preventDefault();
        navigateTo(new Event("click"), "/login");
    };

    form.append(title, username, email, password, confirmPassword, errorMsg, submit, loginLink);
    return form;
}
