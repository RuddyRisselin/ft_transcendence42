import Chart from "chart.js/auto";
import { state } from "../../state";

export default function ProfileStats(): HTMLElement {
    const container = document.createElement("div");
    container.className = "bg-gray-800 text-white rounded-lg shadow-lg p-6 flex flex-col items-center w-full h-full";

    const title = document.createElement("h3");
    title.innerText = "Stats";
    title.className = "text-2xl font-bold mb-4 text-center";

    const statsContainer = document.createElement("div");
    statsContainer.className = "flex flex-col lg:flex-row items-center justify-center w-full gap-8";

    const statsList = document.createElement("div");
    statsList.className = "text-white flex flex-col space-y-3 w-full max-w-md";

    const chartContainer = document.createElement("div");
    chartContainer.className = "w-48 h-48";

    async function fetchStats() {
        if (!state.user) {
            statsList.innerHTML = "<p class='text-red-500 font-semibold'>User not found.</p>";
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
                statsList.innerHTML = "<p class='text-white text-center py-4'>No stats available.</p>";
                return;
            }

            const totalGames = stats.totalGames || 0;
            const wins = stats.wins || 0;
            const losses = stats.losses || 0;
            const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

            // Créer un élément d'info statistique stylé
            function createStatItem(label, value, color) {
                const statItem = document.createElement("div");
                statItem.className = "flex flex-col";
                
                const labelEl = document.createElement("span");
                labelEl.className = "text-gray-400 text-sm";
                labelEl.innerText = label;
                
                const valueEl = document.createElement("span");
                valueEl.className = `text-xl font-bold ${color}`;
                valueEl.innerText = value;
                
                statItem.append(labelEl, valueEl);
                return statItem;
            }

            // Vider la liste et ajouter les nouvelles stats
            statsList.innerHTML = "";
            
            // Total Games
            statsList.appendChild(createStatItem("Total Games:", totalGames, "text-blue-400"));
            
            // Wins
            statsList.appendChild(createStatItem("Wins:", wins, "text-green-500"));
            
            // Losses
            statsList.appendChild(createStatItem("Losses:", losses, "text-red-500"));
            
            // Win Rate
            statsList.appendChild(createStatItem("Win Rate:", `${winrate}%`, "text-yellow-400"));

            renderChart(wins, losses);
        } catch (error) {
            console.error("Error fetching stats:", error);
            statsList.innerHTML = "<p class='text-red-500 font-bold'>Error loading stats.</p>";
        }
    }

    function renderChart(wins, losses) {
        chartContainer.innerHTML = "";
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        chartContainer.appendChild(canvas);

        new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Wins", "Losses"],
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: ["#10B981", "#EF4444"], // Vert et rouge
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            font: {
                                size: 12
                            },
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    fetchStats();
    statsContainer.append(statsList, chartContainer);
    container.append(title, statsContainer);
    return container;
}
