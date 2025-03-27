import { register, login } from "../services/auth";
import { navigateTo } from "../router";

export default function Register() {
    if (localStorage.getItem("user"))
        window.location.href = "/dashboard";
    const form = document.createElement("form");
    form.className = "flex flex-col items-center p-6 bg-gray-900 text-white rounded-xl shadow-lg w-96 mx-auto mt-20 border border-gray-700";

    const title = document.createElement("h2");
    title.innerText = "Inscription";
    title.className = "text-3xl font-bold mb-4 text-center text-blue-400";

    const username = document.createElement("input");
    username.type = "text";
    username.placeholder = "Nom d'utilisateur";
    username.className = "input-style";

    const email = document.createElement("input");
    email.type = "email";
    email.placeholder = "Email";
    email.className = "input-style";

    const password = document.createElement("input");
    password.type = "password";
    password.placeholder = "Mot de passe";
    password.className = "input-style";

    const confirmPassword = document.createElement("input");
    confirmPassword.type = "password";
    confirmPassword.placeholder = "Confirmer le mot de passe";
    confirmPassword.className = "input-style";

    const errorMsg = document.createElement("p");
    errorMsg.className = "text-red-500 text-sm mt-2 hidden";

    const submit = document.createElement("button");
    submit.innerText = "S'inscrire";
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
            errorMsg.innerText = "Erreur : " + error.message;
            errorMsg.classList.remove("hidden");
        }
    };

    const loginLink = document.createElement("a");
    loginLink.innerText = "Deja inscrit ?";
    loginLink.className = "text-blue-400 hover:underline mt-3 cursor-pointer";
    loginLink.onclick = (e) => {
        e.preventDefault();
        navigateTo(new Event("click"), "/login");
    };

    form.append(title, username, email, password, confirmPassword, errorMsg, submit, loginLink);
    return form;
}
