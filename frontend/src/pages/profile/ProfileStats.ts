import Chart from "chart.js/auto";
import { state } from "../../state";

export default function ProfileStats(): HTMLElement {
    const container = document.createElement("div");
    container.className = "col-span-12 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center space-y-4 w-full mx-auto";

    const title = document.createElement("h3");
    title.innerText = "Stats";
    title.className = "text-xl font-extrabold text-white";

    const statsList = document.createElement("div");
    statsList.className = "text-white text-sm space-y-2 flex flex-col items-center";

    const chartContainer = document.createElement("div");
    chartContainer.className = "relative w-40 h-40 mt-4";

    async function fetchStats() {
        if (!state.user) {
            statsList.innerHTML = "<p class='text-red-500 text-sm font-bold'>User not found.</p>";
            return;
        }
        try {
            console.log(`Fetching stats for user ID: ${state.user.id}`);

            const response = await fetch(`/api/user/stats?userId=${state.user.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user stats.");
            }

            const stats = await response.json();
            console.log("Stats received:", stats);

            if (!stats || typeof stats.totalGames === "undefined") {
                statsList.innerHTML = "<p class='text-white text-sm font-semibold'>No stats available.</p>";
                return;
            }

            const totalGames = stats.totalGames || 0;
            const wins = stats.wins || 0;
            const losses = stats.losses || 0;
            const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

            statsList.innerHTML = `
                <p class="text-blue-400 font-bold text-sm">Total Games: <span class="text-white">${totalGames}</span></p>
                <p class="text-green-400 font-bold text-sm">Wins: <span class="text-white">${wins}</span></p>
                <p class="text-red-400 font-bold text-sm">Losses: <span class="text-white">${losses}</span></p>
            `;

            renderChart(wins, losses);
        } catch (error) {
            console.error("Error fetching stats:", error);
            statsList.innerHTML = "<p class='text-red-500 text-sm font-bold'>Error loading stats.</p>";
        }
    }

    function renderChart(wins, losses) {
        chartContainer.innerHTML = "";
        const canvas = document.createElement("canvas");
        canvas.className = "max-w-40 max-h-40";
        chartContainer.appendChild(canvas);

        new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Wins", "Losses"],
                datasets: [{
                    data: [wins, losses],
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
