// Dark mode toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Load and process CSV data
async function loadCSVData() {
    try {
        // In a real implementation, this would fetch from the actual CSV file
        // For now, using sample data based on the provided CSV

        const csvData = [
            {year: 2020, chat_count: 1500, user_count: 100},
            {year: 2021, chat_count: 2000, user_count: 120},
            {year: 2022, chat_count: 2500, user_count: 150}
        ];

        return csvData;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return [];
    }
}

// Create trend chart
function createTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');

    // Prepare data for trend chart
    const years = data.map(item => item.year);
    const chatCounts = data.map(item => item.chat_count);
    const userCounts = data.map(item => item.user_count);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Chat Count',
                    data: chatCounts,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'User Count',
                    data: userCounts,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Trend Analysis: Chat Count vs User Count'
                }
            }
        }
    });
}

// Create comparison chart
function createComparisonChart(data) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    // Prepare data for comparison chart
    const years = data.map(item => item.year);
    const chatCounts = data.map(item => item.chat_count);
    const userCounts = data.map(item => item.user_count);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Chat Count',
                    data: chatCounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'User Count',
                    data: userCounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Comparison: Chat Count vs User Count by Year'
                }
            }
        }
    });
}

// Create distribution chart
function createDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Prepare data for distribution chart
    const years = data.map(item => item.year);
    const chatCounts = data.map(item => item.chat_count);
    const userCounts = data.map(item => item.user_count);

    // Calculate ratios
    const ratios = years.map((year, index) => {
        return (userCounts[index] / chatCounts[index]) * 100;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: years,
            datasets: [{
                label: 'User to Chat Ratio (%)',
                data: ratios,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'User to Chat Ratio Distribution'
                }
            }
        }
    });
}

// Apply filters
function applyFilters() {
    const yearFilter = document.getElementById('yearFilter').value;
    const metricFilter = document.getElementById('metricFilter').value;

    console.log('Applying filters:', { yearFilter, metricFilter });
    // In a real implementation, this would filter the data and update charts
}

// Initialize all charts when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Load CSV data
    const csvData = await loadCSVData();

    if (csvData.length > 0) {
        createTrendChart(csvData);
        createComparisonChart(csvData);
        createDistributionChart(csvData);

        // Add filter functionality
        const applyFiltersBtn = document.getElementById('applyFilters');
        applyFiltersBtn.addEventListener('click', applyFilters);
    } else {
        console.error('No data loaded for charts');
    }
});