// Dark mode toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Sample data for demonstration
const sampleData = {
    data: [
        {
            category: "Electronics",
            sales: 25000,
            region: "North"
        },
        {
            category: "Clothing",
            sales: 18000,
            region: "South"
        },
        {
            category: "Home",
            sales: 12000,
            region: "East"
        },
        {
            category: "Toys",
            sales: 9000,
            region: "West"
        }
    ]
};

// Create main chart
function createMainChart() {
    const ctx = document.getElementById('mainChart').getContext('2d');

    // Prepare data for the main chart
    const categories = sampleData.data.map(item => item.category);
    const sales = sampleData.data.map(item => item.sales);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Sales by Category',
                data: sales,
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
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sales Amount'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Product Categories'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Sales by Product Category'
                }
            }
        }
    });
}

// Create category chart
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    // Prepare data for category chart
    const categories = sampleData.data.map(item => item.category);
    const sales = sampleData.data.map(item => item.sales);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: categories,
            datasets: [{
                label: 'Sales Trend',
                data: sales,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: '#fff',
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sales Amount'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Product Categories'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Sales Trend by Category'
                }
            }
        }
    });
}

// Create region chart
function createRegionChart() {
    const ctx = document.getElementById('regionChart').getContext('2d');

    // Prepare data for region chart
    const regions = sampleData.data.map(item => item.region);
    const sales = sampleData.data.map(item => item.sales);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: regions,
            datasets: [{
                data: sales,
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
                    text: 'Sales Distribution by Region'
                }
            }
        }
    });
}

// Initialize all charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createMainChart();
    createCategoryChart();
    createRegionChart();

    // Add filter functionality
    const dataFilter = document.getElementById('dataFilter');
    const resetFilter = document.getElementById('resetFilter');

    dataFilter.addEventListener('input', function() {
        // In a real implementation, this would filter the charts based on the value
        console.log('Filter value:', this.value);
    });

    resetFilter.addEventListener('click', function() {
        dataFilter.value = 100;
        // Reset charts to original state
        createMainChart();
        createCategoryChart();
        createRegionChart();
    });
});