export default function Navbar() {
	const navbar = document.createElement("nav");
	navbar.className = "bg-gray-800 p-4 text-white flex justify-center space-x-6 fixed top-0 left-0 w-full shadow-md";
  
	navbar.innerHTML = `
	  <a href="/" onclick="navigateTo(event, '/')" class="hover:text-blue-400 transition duration-300">🏠 Accueil</a>
	  <a href="/game" onclick="navigateTo(event, '/game')" class="hover:text-blue-400 transition duration-300">🎮 Jeu</a>
	  <a href="/profile" onclick="navigateTo(event, '/profile')" class="hover:text-blue-400 transition duration-300">👤 Profil</a>
	`;
  
	return navbar;
  }
  