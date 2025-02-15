import { register } from "../services/auth";

export default function Register() {
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

    const errorMsg = document.createElement("p");
    errorMsg.className = "text-red-500 text-sm mt-2 hidden";

    const submit = document.createElement("button");
    submit.innerText = "S'inscrire";
    submit.className = "btn-primary";
    submit.onclick = async (e) => {
        e.preventDefault();
        errorMsg.classList.add("hidden");

        try {
            await register(username.value, email.value, password.value);
            window.location.href = "/login";
        } catch (error) {
            errorMsg.innerText = "Erreur : " + error.message;
            errorMsg.classList.remove("hidden");
        }
    };

    form.append(title, username, email, password, errorMsg, submit);
    return form;
}
