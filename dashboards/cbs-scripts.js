// Dark mode toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Load and process CBS CSV data
async function loadCBSData() {
    try {
        // In a real implementation, this would fetch from the actual CSV file
        // For now, using sample data based on the provided CSV

        const cbsData = [
            {year: 2020, population: 17000000, employment_rate: 68.5},
            {year: 2021, population: 17100000, employment_rate: 69.2},
            {year: 2022, population: 17200000, employment_rate: 70.1}
        ];

        return cbsData;
    } catch (error) {
        console.error('Error loading CBS data:', error);
        return [];
    }
}

// Create CBS trend chart
function createCBSTrendChart(data) {
    const ctx = document.getElementById('cbsTrendChart').getContext('2d');

    // Prepare data for trend chart
    const years = data.map(item => item.year);
    const populations = data.map(item => item.population);
    const employmentRates = data.map(item => item.employment_rate);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Population',
                    data: populations,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: false,
                    yAxisID: 'y'
                },
                {
                    label: 'Employment Rate (%)',
                    data: employmentRates,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1,
                    fill: false,
                    yAxisID: 'y1'
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
                        text: 'Population'
                    },
                    position: 'left'
                },
                y1: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Employment Rate (%)'
                    },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
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
                    text: 'CBS Data Trend Analysis'
                }
            }
        }
    });
}

// Create CBS comparison chart
function createCBSComparisonChart(data) {
    const ctx = document.getElementById('cbsComparisonChart').getContext('2d');

    // Prepare data for comparison chart
    const years = data.map(item => item.year);
    const populations = data.map(item => item.population);
    const employmentRates = data.map(item => item.employment_rate);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Population',
                    data: populations,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Employment Rate (%)',
                    data: employmentRates,
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
                        text: 'Value'
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
                    text: 'CBS Data Comparison by Year'
                }
            }
        }
    });
}

// Create CBS distribution chart
function createCBSDistributionChart(data) {
    const ctx = document.getElementById('cbsDistributionChart').getContext('2d');

    // Prepare data for distribution chart
    const years = data.map(item => item.year);
    const populations = data.map(item => item.population);
    const employmentRates = data.map(item => item.employment_rate);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: years,
            datasets: [{
                label: 'Population Distribution',
                data: populations,
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
                    text: 'Population Distribution by Year'
                }
            }
        }
    });
}

// Apply CBS filters
function applyCBSFilters() {
    const yearFilter = document.getElementById('cbsYearFilter').value;
    const metricFilter = document.getElementById('cbsMetricFilter').value;

    console.log('Applying CBS filters:', { yearFilter, metricFilter });
    // In a real implementation, this would filter the data and update charts
}

// Initialize all charts when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Load CBS data
    const cbsData = await loadCBSData();

    if (cbsData.length > 0) {
        createCBSTrendChart(cbsData);
        createCBSComparisonChart(cbsData);
        createCBSDistributionChart(cbsData);

        // Add filter functionality
        const applyFiltersBtn = document.getElementById('applyCBSFilters');
        applyFiltersBtn.addEventListener('click', applyCBSFilters);
    } else {
        console.error('No data loaded for CBS charts');
    }
});