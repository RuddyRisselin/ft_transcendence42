export default function BackButton(): HTMLElement {
    const backButton = document.createElement("div");
    backButton.className = "absolute top-6 left-6 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer text-white text-xl transition duration-300 transform hover:scale-110 hover:bg-gray-600 shadow-lg";
    backButton.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>`;
    backButton.onclick = () => {
        window.history.back();
    };
    return backButton;
}
