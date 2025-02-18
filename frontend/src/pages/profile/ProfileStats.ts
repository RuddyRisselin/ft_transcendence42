import Chart from "chart.js/auto";
import { state } from "../../state";

export default function ProfileStats(): HTMLElement {
    const container = document.createElement("div");
    container.className = "col-span-12 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center space-y-6";

    const title = document.createElement("h3");
    title.innerText = "Stats";
    title.className = "text-2xl font-extrabold text-white mb-4";

    const statsList = document.createElement("div");
    statsList.className = "text-white text-lg space-y-4 flex flex-col items-center";

    const chartContainer = document.createElement("div");
    chartContainer.className = "relative w-48 h-48 mt-6";

    async function fetchStats() {
        if (!state.user) {
            statsList.innerHTML = "<p class='text-red-500 text-lg font-bold'>User not found.</p>";
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
                statsList.innerHTML = "<p class='text-white text-lg font-semibold'>No stats available.</p>";
                return;
            }

            const totalGames = stats.totalGames || 0;
            const wins = stats.wins || 0;
            const losses = stats.losses || 0;
            const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

            statsList.innerHTML = `
                <p class="text-blue-400 font-bold text-xl">Total Games: <span class="text-white">${totalGames}</span></p>
                <p class="text-green-400 font-bold text-xl">Wins: <span class="text-white">${wins}</span></p>
                <p class="text-red-400 font-bold text-xl">Losses: <span class="text-white">${losses}</span></p>
            `;

            renderChart(wins, losses);
        } catch (error) {
            console.error("Error fetching stats:", error);
            statsList.innerHTML = "<p class='text-red-500 text-lg font-bold'>Error loading stats.</p>";
        }
    }

    function renderChart(wins, losses) {
        chartContainer.innerHTML = "";
        const canvas = document.createElement("canvas");
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
