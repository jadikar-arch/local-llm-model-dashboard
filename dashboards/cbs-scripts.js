const dashboardState = {
    data: [],
    charts: {}
};

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(header => header.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        const item = {};

        headers.forEach((header, index) => {
            const value = values[index] ?? '';
            item[header] = Number.isNaN(Number(value)) ? value : Number(value);
        });

        return item;
    });
}

async function loadData() {
    try {
        const response = await fetch('../data/real-data.csv');
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
        }

        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading CBS data:', error);
        return [];
    }
}

function populateFilters(data) {
    const yearFilter = document.getElementById('yearFilter');
    const years = [...new Set(data.map(item => item.year))];

    yearFilter.innerHTML = '<option value="all">All Years</option>' +
        years.map(year => `<option value="${year}">${year}</option>`).join('');
}

function getFilteredData() {
    const yearFilter = document.getElementById('yearFilter').value;
    const metricFilter = document.getElementById('metricFilter').value;
    let filtered = [...dashboardState.data];

    if (yearFilter !== 'all') {
        filtered = filtered.filter(item => String(item.year) === String(yearFilter));
    }

    if (metricFilter !== 'all') {
        filtered = filtered.filter(item => item[metricFilter] !== undefined && item[metricFilter] !== null);
    }

    return filtered;
}

function destroyCharts() {
    Object.values(dashboardState.charts).forEach(chart => chart.destroy());
    dashboardState.charts = {};
}

function renderCharts(data) {
    destroyCharts();

    const years = data.map(item => item.year);
    const chatCounts = data.map(item => item.chat_count);
    const userCounts = data.map(item => item.user_count);

    const trendCtx = document.getElementById('cbsTrendChart').getContext('2d');
    dashboardState.charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Chat Count',
                    data: chatCounts,
                    borderColor: '#14b8a6',
                    backgroundColor: 'rgba(20, 184, 166, 0.12)',
                    borderWidth: 3,
                    tension: 0.25,
                    fill: false
                },
                {
                    label: 'User Count',
                    data: userCounts,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.12)',
                    borderWidth: 3,
                    tension: 0.25,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'CBS trend analysis' },
                legend: { position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Year' } },
                y: { beginAtZero: true, title: { display: true, text: 'Count' } }
            }
        }
    });

    const comparisonCtx = document.getElementById('cbsComparisonChart').getContext('2d');
    dashboardState.charts.comparison = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Chat Count',
                    data: chatCounts,
                    backgroundColor: '#14b8a6',
                    borderRadius: 6
                },
                {
                    label: 'User Count',
                    data: userCounts,
                    backgroundColor: '#f97316',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'CBS comparison by year' },
                legend: { position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Year' } },
                y: { beginAtZero: true, title: { display: true, text: 'Count' } }
            }
        }
    });

    const distributionCtx = document.getElementById('cbsDistributionChart').getContext('2d');
    const ratios = years.map((year, index) => {
        const chat = Number(chatCounts[index] ?? 0);
        const users = Number(userCounts[index] ?? 0);
        return chat === 0 ? 0 : (users / chat) * 100;
    });

    dashboardState.charts.distribution = new Chart(distributionCtx, {
        type: 'doughnut',
        data: {
            labels: years,
            datasets: [{
                label: 'User-to-Chat Ratio (%)',
                data: ratios,
                backgroundColor: ['#f97316', '#3b82f6', '#10b981'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'CBS user-to-chat ratio' },
                legend: { position: 'bottom' }
            }
        }
    });
}

function applyFilters() {
    const filtered = getFilteredData();
    if (filtered.length > 0) {
        renderCharts(filtered);
    } else {
        renderCharts([{ year: 'No data', chat_count: 0, user_count: 0 }]);
    }
}

function resetFilters() {
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('metricFilter').value = 'all';
    renderCharts(dashboardState.data);
}

document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

document.addEventListener('DOMContentLoaded', async () => {
    dashboardState.data = await loadData();

    if (dashboardState.data.length > 0) {
        populateFilters(dashboardState.data);
        renderCharts(dashboardState.data);

        document.getElementById('applyFilters').addEventListener('click', applyFilters);
        document.getElementById('resetFilter').addEventListener('click', resetFilters);
    } else {
        console.error('No data loaded for CBS charts');
    }
});