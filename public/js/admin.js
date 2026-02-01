const API_URL = 'http://localhost:3000/api';

// Auto-refresh interval (5 seconds)
const REFRESH_INTERVAL = 5000;

let efficiencyChart = null;
let trendChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    renderLeaderboard();

    // Real-time polling
    setInterval(() => {
        updateEfficiencyChart();
        renderLeaderboard();
    }, REFRESH_INTERVAL);

    console.log('Real-time updates enabled (every 5 seconds)');
});

function initCharts() {
    // Chart.js global config for dark theme
    Chart.defaults.color = '#6b7280';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

    // Initialize Efficiency Chart
    const ctx1 = document.getElementById('efficiencyChart').getContext('2d');
    efficiencyChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Loading...'],
            datasets: [{
                data: [1],
                backgroundColor: ['#333'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { padding: 20, usePointStyle: true, pointStyle: 'circle', font: { size: 13 } }
                }
            }
        }
    });

    // Initialize Trend Chart
    const ctx2 = document.getElementById('trendChart').getContext('2d');
    const gradient = ctx2.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    trendChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Collections',
                data: [],
                borderColor: '#8b5cf6',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#000',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { padding: 10 } },
                x: { grid: { display: false }, ticks: { padding: 10 } }
            },
            plugins: { legend: { display: false } },
            interaction: { intersect: false, mode: 'index' }
        }
    });

    // Initial data load
    updateEfficiencyChart();
    updateTrendChart();
}

function updateEfficiencyChart() {
    fetch(`${API_URL}/analytics/efficiency`)
        .then(res => res.json())
        .then(data => {
            let labels = data.map(item => item.waste_type);
            let values = data.map(item => parseFloat(item.total_weight));

            if (data.length === 0) {
                labels = ['No Data'];
                values = [1];
            }

            efficiencyChart.data.labels = labels;
            efficiencyChart.data.datasets[0].data = values;
            efficiencyChart.data.datasets[0].backgroundColor = ['#ccff00', '#3b82f6', '#ffcc00', '#8b5cf6'];
            efficiencyChart.update('none'); // No animation for real-time
        })
        .catch(err => console.error('Error loading efficiency chart:', err));
}

function updateTrendChart() {
    fetch(`${API_URL}/analytics/trends`)
        .then(res => res.json())
        .then(data => {
            trendChart.data.labels = data.map(item => item.month);
            trendChart.data.datasets[0].data = data.map(item => item.count);
            trendChart.update('none');
        })
        .catch(err => console.error('Error loading trend chart:', err));
}

function renderLeaderboard() {
    fetch(`${API_URL}/analytics/leaderboard`)
        .then(res => res.json())
        .then(users => {
            const tbody = document.getElementById('leaderboard-body');

            if (users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                            No citizens yet. Be the first to earn Green Points!
                        </td>
                    </tr>
                `;
                return;
            }

            let html = '';
            users.forEach((user, index) => {
                let rankDisplay = `#${index + 1}`;
                let rankStyle = 'color: var(--text-primary);';
                if (index === 0) { rankDisplay = '🥇'; rankStyle = 'font-size: 1.5rem;'; }
                else if (index === 1) { rankDisplay = '🥈'; rankStyle = 'font-size: 1.5rem;'; }
                else if (index === 2) { rankDisplay = '🥉'; rankStyle = 'font-size: 1.5rem;'; }

                html += `
                    <tr>
                        <td style="font-weight: bold; ${rankStyle}">${rankDisplay}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #ccff00, #3b82f6); display: flex; align-items: center; justify-content: center; color: black; font-weight: 600;">
                                    ${user.username.charAt(0).toUpperCase()}
                                </div>
                                ${user.username}
                            </div>
                        </td>
                        <td style="text-align: right;">
                            <span style="background: rgba(0, 77, 64, 0.5); color: #ccff00; padding: 6px 14px; border-radius: 50px; font-weight: 600;">
                                ${user.green_points} pts
                            </span>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
            document.getElementById('total-citizens').textContent = users.length;
        })
        .catch(err => console.error('Error loading leaderboard:', err));
}
