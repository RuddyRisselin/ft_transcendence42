import Layout from "../components/layout";
import { getUser, setUser } from "../state";

export default function Profile() {
  const user = getUser();

  const container = document.createElement("div");
  container.className = "flex flex-col items-center justify-center min-h-screen p-4";

  const title = document.createElement("h1");
  title.className = "text-3xl font-bold mb-4";
  title.innerText = "Profil du Joueur";

  const form = document.createElement("form");
  form.className = "bg-gray-800 p-6 rounded-lg shadow-lg text-white w-80";

  form.innerHTML = `
    <label class="block mb-2">Pseudo:</label>
    <input type="text" id="username" class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" value="${user.username}" />

    <label class="block mt-4 mb-2">Email:</label>
    <input type="email" id="email" class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" value="${user.email}" />

    <button type="submit" class="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">Enregistrer</button>
  `;

  form.onsubmit = (event) => {
    event.preventDefault();
    const newUsername = (document.getElementById("username") as HTMLInputElement).value;
    const newEmail = (document.getElementById("email") as HTMLInputElement).value;
    setUser({ username: newUsername, email: newEmail });
    alert("Profil mis à jour !");
  };

  container.appendChild(title);
  container.appendChild(form);

  return Layout(container);
}
