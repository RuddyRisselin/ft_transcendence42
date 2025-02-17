import Chart from "chart.js/auto";
import { state } from "../../state";

export default function ProfileStats(): HTMLElement {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center w-full p-4 bg-gray-800 rounded-lg shadow-lg";
    container.style.maxWidth = "400px";

    const title = document.createElement("h3");
    title.innerText = "Stats";
    title.className = "text-lg font-bold text-white mb-2";

    const statsList = document.createElement("div");
    statsList.className = "text-white text-sm space-y-2";

    const chartContainer = document.createElement("div");
    chartContainer.className = "relative w-40 h-40 mt-4"; // Taille fixe du graphique

    async function fetchStats() {
        if (!state.user) {
            statsList.innerHTML = "<p class='text-red-500'>User not found.</p>";
            return;
        }
        try {
            const response = await fetch(`/api/user/stats?userId=${state.user.id}`);
            const stats = await response.json();
            
            if (!stats.totalGames) {
                stats.totalGames = 0;
                stats.wins = 0;
                stats.losses = 0;
            }

            statsList.innerHTML = `
                <p>Total Games: ${stats.totalGames}</p>
                <p>Wins: ${stats.wins}</p>
                <p>Losses: ${stats.losses}</p>
            `;

            const winrate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;
            renderChart(winrate);
        } catch (error) {
            console.error("Error fetching stats:", error);
            statsList.innerHTML = "<p class='text-red-500'>Error loading stats.</p>";
        }
    }

    function renderChart(winrate) {
        chartContainer.innerHTML = ""; // Nettoyage avant d'ajouter le canvas
        const canvas = document.createElement("canvas");
        chartContainer.appendChild(canvas);

        new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Wins", "Losses"],
                datasets: [{
                    data: [winrate, 100 - winrate],
                    backgroundColor: ["#4CAF50", "#F44336"],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }

    fetchStats();
    container.append(title, statsList, chartContainer);
    return container;
}
