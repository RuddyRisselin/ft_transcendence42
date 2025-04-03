import { state } from "../state";
import { logout, connectToWebSocket } from "../services/auth";
import { getUsers } from "../services/userService";
import { getFriends, getFriendRequests, removeFriend, acceptFriendRequest, rejectFriendRequest, addFriend } from "../services/friendService";
import FriendProfile from "../pages/profile/FriendProfile";
import { translateText } from "../translate";

export default async function Sidebar(): Promise<HTMLElement> {

    /*          TRANSLATE TAB       */
    const textToTranslate = [
        "invité",
        "Amis",
        "Déconnexion",
        "Gestion des Amis",
        "Demande envoyée",
        "Erreur",
        "Aucun utilisateur trouvé",
        "Demandes d'amitié",
        "Mes Amis",
        "Aucune demande en attente",
        "Aucun ami pour le moment",
        "Voulez-vous vraiment supprimer cet ami ?",
        "Rechercher un utilisateur..."
    ];
    const [
        translatedGuest,
        translatedFriends,
        translatedDeconnexion,
        translatedManageFriends,
        translatedSendFriends,
        translatedError,
        translatedNoUserFound,
        translatedFriendsRequest,
        translatedMyFriends,
        translatedNoRequestinWait,
        translatedNoFriendsForNow,
        translatedNoConfirmDeleteFriend,
        translatedSearchUser
    ] = await Promise.all(textToTranslate.map(text => translateText(text)));

    const sidebar = document.createElement("aside");
    sidebar.className = "fixed inset-y-0 left-0 w-64 bg-gray-900 text-white flex flex-col shadow-lg z-20 overflow-hidden";

    // Conteneur principal avec animation
    const mainContainer = document.createElement("div");
    mainContainer.className = "flex w-[calc(200%)] h-full transition-transform duration-300";

    // Conteneur de la sidebar principale
    const sidebarContent = document.createElement("div");
    sidebarContent.className = "w-64 flex-shrink-0 flex flex-col h-full";

    // Conteneur de la gestion des amis
    const friendsContent = document.createElement("div");
    friendsContent.className = "w-64 flex-shrink-0 flex flex-col h-full bg-gray-900";

    // Conteneur de l'utilisateur connecté
    const userContainer = document.createElement("div");
    userContainer.className = "flex flex-col items-center p-6 border-b border-gray-700/50 bg-gray-800/30";

    // Avatar avec bordure animée
    const avatarContainer = document.createElement("div");
    avatarContainer.className = "relative p-1 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500";
    
    const avatar = document.createElement("img");
    avatar.src = "http://localhost:3000/images/" + state.user.avatar || "http://localhost:3000/images/default.jpg";
    avatar.className = "w-16 h-16 rounded-full border-2 border-gray-900";
    avatarContainer.appendChild(avatar);

    // Nom d'utilisateur
    const username = document.createElement("span");
    username.innerHTML = `${state.user?.username || translatedGuest}`;
    username.className = "text-lg font-semibold mt-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent";

    // Statut (Online/Offline)
    const statusContainer = document.createElement("div");
    statusContainer.className = "flex items-center mt-2";

    const statusIndicator = document.createElement("span");
    statusIndicator.className = "w-2 h-2 rounded-full mr-2";

    const statusText = document.createElement("span");
    statusText.className = "text-sm text-gray-400";

    async function updateStatus() {
        const users = await getUsers();
        const currentUser = users.find(user => user.id === state.user?.id);
        
        if (currentUser) {
            statusIndicator.className = `w-2 h-2 rounded-full mr-2 ${currentUser.status === "online" ? "bg-green-500" : "bg-red-500"}`;
            statusText.innerHTML = currentUser.status === "online" ?  (localStorage.getItem("language") == "fr" ? "En ligne" :  await translateText("online")) : (localStorage.getItem("language") == "fr" ? "Hors ligne" :  await translateText("offline"));
        }
    }

    updateStatus();
    setInterval(updateStatus, 5000);
    statusContainer.append(statusIndicator, statusText);
    userContainer.append(avatarContainer, username, statusContainer);

    // Navigation
    const nav = document.createElement("nav");
    nav.className = "flex flex-col mt-4 px-4 space-y-2";

    const navLinks = [
        { icon: "🏠", text: "Tableau de bord", href: "/dashboard" },
        { icon: "👤", text: "Profile", href: "/profile" },
        { icon: "🎮", text: "Matches", href: "/matches" },
        { icon: "📜", text: "Règles", href: "/rules" }
    ];

    navLinks.forEach(link => {
        const a = document.createElement("a");
        a.href = link.href;
        a.className = "flex items-center p-3 hover:bg-gray-800/50 rounded-lg transition duration-200 group";

        const icon = document.createElement("span");
        icon.innerHTML = link.icon;
        icon.className = "mr-3 text-lg group-hover:scale-110 transition-transform";

        const text = document.createElement("span");
        translateText(link.text).then((translated) => {
            text.innerHTML = translated;
        })
        text.className = "text-gray-300 group-hover:text-white transition-colors";

        a.append(icon, text);
        nav.appendChild(a);
    });

    // Bouton amis
    const friendsButton = document.createElement("button");
    friendsButton.className = "flex items-center p-3 hover:bg-gray-800/50 rounded-lg transition duration-200 group w-full mt-2";
    friendsButton.innerHTML = '<span class="mr-3 text-lg group-hover:scale-110 transition-transform">👥</span>' + `<span class="text-gray-300 group-hover:text-white transition-colors">${translatedFriends}</span>`;
    friendsButton.onclick = () => {
        mainContainer.style.transform = "translateX(-256px)";
        // Recharger les données quand on ouvre le panneau
        loadUsers();
        loadFriendRequests();
        loadFriends();
    };
    nav.appendChild(friendsButton);

    // Bouton de déconnexion
    const logoutButton = document.createElement("button");
    logoutButton.className = "mx-4 mb-6 p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center rounded-lg transition duration-200 group border border-red-500/20";
    logoutButton.innerHTML = '<span class="mr-2 group-hover:scale-110 transition-transform">🔒 </span>' +  translatedDeconnexion;
    logoutButton.onclick = async () => {
        sidebar.remove();
        await logout();
    };

    // Construction de la section amis
    const friendsHeader = document.createElement("div");
    friendsHeader.className = "p-6 border-b border-gray-700/50 bg-gray-800/30 flex items-center";
    
    const backButton = document.createElement("button");
    backButton.className = "mr-3 text-gray-400 hover:text-white transition-colors";
    backButton.innerHTML = "◀";
    backButton.onclick = () => {
        mainContainer.style.transform = "translateX(0)";
    };

    const friendsTitle = document.createElement("h2");
    friendsTitle.className = "text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent";
    friendsTitle.innerHTML = translatedManageFriends;

    friendsHeader.append(backButton, friendsTitle);
    friendsContent.appendChild(friendsHeader);

    // Contenu de la gestion des amis
    const friendsManager = document.createElement("div");
    friendsManager.className = "p-4 space-y-6 overflow-y-auto custom-scrollbar h-[calc(100vh-64px)]";

    // Recherche d'amis avec autocomplétion
    const searchSection = document.createElement("div");
    searchSection.className = "bg-gray-800/50 p-4 rounded-lg border border-purple-500/20";

    const searchForm = document.createElement("form");
    searchForm.className = "flex flex-col gap-2";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = translatedSearchUser;
    searchInput.className = "flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors";

    const searchResults = document.createElement("div");
    searchResults.className = "hidden flex-col gap-1 mt-2 max-h-32 overflow-y-auto custom-scrollbar";

    searchInput.oninput = async () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm.length < 2) {
            searchResults.innerHTML = "";
            searchResults.className = "hidden flex-col gap-1 mt-2";
            return;
        }

        const filteredUsers = users.filter(u => 
            u.username.toLowerCase().includes(searchTerm) && 
            u.id !== state.user.id
        );

        searchResults.innerHTML = "";
        if (filteredUsers.length > 0) {
            searchResults.className = "flex flex-col gap-1 mt-2 max-h-32 overflow-y-auto custom-scrollbar";
            filteredUsers.forEach(user => {
                const userItem = document.createElement("button");
                userItem.type = "button";
                userItem.className = "flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded-lg transition-colors";
                userItem.innerHTML = `
                    <img src="http://localhost:3000/images/${user.avatar}" class="w-6 h-6 rounded-full border border-purple-500/30">
                    <span class="text-sm">${user.username}</span>
                `;
                userItem.onclick = async () => {
                    try {
                        await addFriend(user.id);
                        searchInput.value = "";
                        searchResults.className = "hidden flex-col gap-1 mt-2";
                        loadFriendRequests();
                        // Feedback visuel
                        const originalContent: string = userItem.innerHTML;

                        userItem.innerHTML = "✅ " + translatedSendFriends;
                        userItem.className += " text-green-400";
                        setTimeout(() => {
                            userItem.innerHTML = originalContent;
                            userItem.className = userItem.className.replace(" text-green-400", "");
                        }, 2000);
                    } catch (error) {
                        // Feedback d'erreur
                        const originalContent: string = userItem.innerHTML;
                        userItem.innerHTML = "❌ " +  translatedError;
                        userItem.className += " text-red-400";
                        setTimeout(() => {
                            userItem.innerHTML = originalContent;
                            userItem.className = userItem.className.replace(" text-red-400", "");
                        }, 2000);
                    }
                };
                searchResults.appendChild(userItem);
            });
        } else {
            searchResults.className = "flex flex-col gap-1 mt-2";
            searchResults.innerHTML = `<div class="text-gray-400 text-sm text-center py-1">${translatedNoUserFound}</div>`;
        }
    };

    searchForm.onsubmit = (e) => e.preventDefault();
    searchForm.append(searchInput, searchResults);
    searchSection.appendChild(searchForm);

    // Section demandes d'amitié
    const requestsSection = document.createElement("div");
    requestsSection.className = "bg-gray-800/50 p-4 rounded-lg border border-yellow-500/20";

    const requestsTitle = document.createElement("h3");
    requestsTitle.className = "text-yellow-300 font-semibold mb-3 flex items-center gap-2";
    requestsTitle.innerHTML = "📨 " + translatedFriendsRequest;

    const requestsList = document.createElement("ul");
    requestsList.className = "space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar";

    requestsSection.append(requestsTitle, requestsList);

    // Section liste d'amis
    const friendsList = document.createElement("div");
    friendsList.className = "bg-gray-800/50 p-4 rounded-lg border border-green-500/20";

    const friendsListTitle = document.createElement("h3");
    friendsListTitle.className = "text-green-300 font-semibold mb-3 flex items-center gap-2";
    friendsListTitle.innerHTML = "👥 " + translatedMyFriends;

    const friendsUl = document.createElement("ul");
    friendsUl.className = "space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar";

    friendsList.append(friendsListTitle, friendsUl);

    // Ajout des sections au gestionnaire d'amis
    friendsManager.append(searchSection, requestsSection, friendsList);
    friendsContent.appendChild(friendsManager);

    // Fonctions de gestion des amis
    let users: any[] = [];

    async function loadUsers() {
        users = await getUsers();
    }

    async function loadFriendRequests() {
        const requests = await getFriendRequests();
        requestsList.innerHTML = "";

        if (requests.length === 0) {
            requestsList.innerHTML = `<li class="text-gray-400 text-center py-2">${translatedNoRequestinWait}</li>`;
            return;
        }

        requests.forEach((request: any) => {
            const li = document.createElement("li");
            li.className = "flex items-center justify-between p-2 bg-gray-700/50 rounded-lg";

            const userInfo = document.createElement("div");
            userInfo.className = "flex items-center gap-2";

            const avatar = document.createElement("img");
            avatar.src = `http://localhost:3000/images/${request.avatar}`;
            avatar.className = "w-8 h-8 rounded-full border border-yellow-500/30";

            const username = document.createElement("span");
            username.innerHTML = request.username;
            username.className = "text-sm";

            userInfo.append(avatar, username);

            const buttons = document.createElement("div");
            buttons.className = "flex gap-1";

            const acceptBtn = document.createElement("button");
            acceptBtn.innerHTML = "✅";
            acceptBtn.className = "p-1.5 bg-green-600 hover:bg-green-500 rounded-lg transition-colors";
            acceptBtn.onclick = async () => {
                await acceptFriendRequest(request.id);
                loadFriendRequests();
                loadFriends();
            };

            const rejectBtn = document.createElement("button");
            rejectBtn.innerHTML = "❌";
            rejectBtn.className = "p-1.5 bg-red-600 hover:bg-red-500 rounded-lg transition-colors";
            rejectBtn.onclick = async () => {
                await rejectFriendRequest(request.id);
                loadFriendRequests();
            };

            buttons.append(acceptBtn, rejectBtn);
            li.append(userInfo, buttons);
            requestsList.appendChild(li);
        });
    }

    async function loadFriends() {
        const friends = await getFriends();
        friendsUl.innerHTML = "";

        if (friends.length === 0) {
            friendsUl.innerHTML = `<li class="text-gray-400 text-center py-2">${translatedNoFriendsForNow}</li>`;
            return;
        }

        friends.sort((a: any, b: any) => (a.status === "online" ? -1 : 1));

        friends.forEach(async (friend: any) => {
            const li = document.createElement("li");
            li.id = `friend-${friend.id}`;
            li.className = `flex items-center justify-between p-2 ${friend.status === "online" ? "bg-green-900/30" : "bg-gray-700/50"} rounded-lg group`;

            const userInfo = document.createElement("div");
            userInfo.className = "flex items-center gap-2";

            const avatar = document.createElement("img");
            avatar.src = `http://localhost:3000/images/${friend.avatar}`;
            avatar.className = "w-8 h-8 rounded-full border border-green-500/30";

            const username = document.createElement("div");
            username.className = "flex flex-col";
            
            //ICII
            username.innerHTML = `
                <span class="text-sm">${friend.username}</span>
                <span class="text-xs ${friend.status === "online" ? "text-green-400" : "text-gray-400"}">
                    ${friend.status === "online" ? (localStorage.getItem("language") == "fr" ? "En ligne" :  await translateText("online")) : (localStorage.getItem("language") == "fr" ? "Hors ligne" :  await translateText("offline"))}
                </span>
            `;

            userInfo.append(avatar, username);

            const buttonsContainer = document.createElement("div");
            buttonsContainer.className = "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity";

            const viewProfileBtn = document.createElement("button");
            viewProfileBtn.innerHTML = "👤";
            viewProfileBtn.className = "p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors";
            viewProfileBtn.onclick = () => {
                const mainContent = document.querySelector(".flex-1");
                if (mainContent) {
                    mainContent.innerHTML = "";
                    mainContent.appendChild(FriendProfile(friend.id));
                }
            };

            const removeBtn = document.createElement("button");
            removeBtn.innerHTML = "🗑️";
            removeBtn.className = "p-1.5 bg-red-600 hover:bg-red-500 rounded-lg transition-all scale-95 group-hover:scale-100";
            removeBtn.onclick = async () => {
                if (confirm(translatedNoConfirmDeleteFriend)) {
                    await removeFriend(friend.id);
                    loadFriends();
                }
            };

            buttonsContainer.append(viewProfileBtn, removeBtn);
            li.append(userInfo, buttonsContainer);
            friendsUl.appendChild(li);
        });
    }

    // Mise à jour du statut des amis via WebSocket avec notification
    connectToWebSocket(String(state.user.id), (message) => {
        if (message.type === "user_status") {
            const friendElement = document.getElementById(`friend-${message.userId}`);
            if (friendElement) {
                friendElement.className = `flex items-center justify-between p-2 ${message.status === "online" ? "bg-green-900/30" : "bg-gray-700/50"} rounded-lg group`;
                const statusSpan = friendElement.querySelector(".text-xs");
                if (statusSpan) {
                    statusSpan.className = `text-xs ${message.status === "online" ? "text-green-400" : "text-gray-400"}`;
                    statusSpan.innerHTML = message.status === "online" ? "🟢 En ligne" : "⭘ Hors ligne";
                }
            }
        }
    });


    
    const languageDiv = document.createElement("div");
    languageDiv.className = "mt-auto mb-4 flex p-3 flex-row flex-wrap justify-around items-center";
    // languageDiv.className = "mt-auto mb-4 mx-4 p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center rounded-lg transition duration-200 group border border-red-500/20"
    const btnEN = document.createElement("button");
    const btnES = document.createElement("button");
    const btnFR = document.createElement("button");
    btnEN.innerHTML = "🇺🇸";
    btnEN.className = "p-1";
    
    btnES.innerHTML = "🇪🇦";
    btnES.className = "p-1";
    
    btnFR.innerHTML = "🇨🇵";
    btnFR.className = "p-1";
    languageDiv.appendChild(btnEN);
    languageDiv.appendChild(btnES);
    languageDiv.appendChild(btnFR);

    // function setLanguage(language: string)
    // {
    //     localStorage.setItem("language", language);
       
    // }

    btnEN.onclick = async () => {
        const langue = "en";
        localStorage.setItem("language", langue);
        window.location.reload();
    };
    btnES.onclick = async () => {
        const langue = "es";
        localStorage.setItem("language", langue);
        window.location.reload();
    };
    btnFR.onclick = async () => {
        const langue = "fr";
        localStorage.setItem("language", langue);
        window.location.reload();
    };


    // Assemblage final    
    sidebarContent.append(userContainer, nav, languageDiv, logoutButton);
    mainContainer.append(sidebarContent, friendsContent);
    sidebar.appendChild(mainContainer);
    // setLanguage("fr");
    return sidebar;
}