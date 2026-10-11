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
        const response = await fetch('data/real-data.csv');
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
        }

        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading CSV data:', error);
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

function buildChartConfig({ id, title, type, labels, dataSeries, backgroundColors, borderColors }) {
    const datasetDefinitions = [
        {
            label: 'Chat Count',
            data: dataSeries.chat,
            backgroundColor: backgroundColors.chat,
            borderColor: borderColors.chat,
            borderWidth: 3,
            tension: 0.25,
            fill: false,
            borderRadius: 6
        },
        {
            label: 'User Count',
            data: dataSeries.user,
            backgroundColor: backgroundColors.user,
            borderColor: borderColors.user,
            borderWidth: 3,
            tension: 0.25,
            fill: false,
            borderRadius: 6
        }
    ];

    if (type === 'doughnut') {
        return {
            type,
            data: {
                labels,
                datasets: [{
                    label: 'User-to-Chat Ratio (%)',
                    data: dataSeries.ratio,
                    backgroundColor: ['#f97316', '#3b82f6', '#10b981'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: title },
                    legend: { position: 'bottom' }
                }
            }
        };
    }

    return {
        type,
        data: {
            labels,
            datasets: datasetDefinitions
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: title },
                legend: { position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Year' } },
                y: { beginAtZero: true, title: { display: true, text: 'Count' } }
            }
        }
    };
}

function renderCharts(data) {
    destroyCharts();

    const years = data.map(item => item.year);
    const chatCounts = data.map(item => item.chat_count);
    const userCounts = data.map(item => item.user_count);
    const ratios = years.map((_, index) => {
        const chat = Number(chatCounts[index] ?? 0);
        const users = Number(userCounts[index] ?? 0);
        return chat === 0 ? 0 : (users / chat) * 100;
    });

    const chartDefinitions = [
        {
            id: 'overviewTrendChart',
            title: 'Local model usage trend',
            type: 'line',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: 'rgba(20, 184, 166, 0.12)', user: 'rgba(249, 115, 22, 0.12)' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        },
        {
            id: 'overviewComparisonChart',
            title: 'Chat vs user comparison',
            type: 'bar',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: '#14b8a6', user: '#f97316' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        },
        {
            id: 'overviewDistributionChart',
            title: 'User-to-chat ratio',
            type: 'doughnut',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: '#14b8a6', user: '#f97316' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        },
        {
            id: 'dutchTrendChart',
            title: 'Dutch statistics trend',
            type: 'line',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: 'rgba(20, 184, 166, 0.12)', user: 'rgba(249, 115, 22, 0.12)' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        },
        {
            id: 'dutchComparisonChart',
            title: 'Year-over-year comparison',
            type: 'bar',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: '#14b8a6', user: '#f97316' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        },
        {
            id: 'dutchDistributionChart',
            title: 'User-to-chat ratio by year',
            type: 'doughnut',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: '#14b8a6', user: '#f97316' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        },
        {
            id: 'cbsTrendChart',
            title: 'CBS trend analysis',
            type: 'line',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: 'rgba(20, 184, 166, 0.12)', user: 'rgba(249, 115, 22, 0.12)' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        },
        {
            id: 'cbsComparisonChart',
            title: 'CBS comparison by year',
            type: 'bar',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: '#14b8a6', user: '#f97316' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        },
        {
            id: 'cbsDistributionChart',
            title: 'CBS user-to-chat ratio',
            type: 'doughnut',
            dataSeries: { chat: chatCounts, user: userCounts, ratio: ratios },
            backgroundColors: { chat: '#14b8a6', user: '#f97316' },
            borderColors: { chat: '#14b8a6', user: '#f97316' }
        }
    ];

    chartDefinitions.forEach(definition => {
        const canvas = document.getElementById(definition.id);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        dashboardState.charts[definition.id] = new Chart(ctx, buildChartConfig({
            ...definition,
            labels: years,
            dataSeries: definition.dataSeries
        }));
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

const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    dashboardState.data = await loadData();

    if (dashboardState.data.length > 0) {
        populateFilters(dashboardState.data);
        renderCharts(dashboardState.data);

        const applyFiltersButton = document.getElementById('applyFilters');
        const resetFilterButton = document.getElementById('resetFilter');

        if (applyFiltersButton) {
            applyFiltersButton.addEventListener('click', applyFilters);
        }

        if (resetFilterButton) {
            resetFilterButton.addEventListener('click', resetFilters);
        }
    } else {
        console.error('No data loaded for charts');
    }
});