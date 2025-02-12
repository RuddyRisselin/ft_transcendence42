import Navbar from "./navbar";

export default function Layout(pageContent: HTMLElement) {
  const container = document.createElement("div");
  container.className = "min-h-screen flex flex-col bg-gray-900 text-white";

  container.appendChild(Navbar());

  // Contenu principal
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "flex flex-col items-center justify-center min-h-screen mt-16 px-4 w-full";

  contentWrapper.appendChild(pageContent);
  container.appendChild(contentWrapper);

  return container;
}
