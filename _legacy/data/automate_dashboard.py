import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load data
file_path = '/Users/munirdin/Documents/projects/app-to-git/dashboard-project/data/real-data.csv'
df = pd.read_csv(file_path)

# Basic analysis
print("\nFirst 5 rows:")
print(df.head())
print("\nSummary statistics:")
print(df.describe())
print("\nMissing values:")
print(df.isnull().sum())

# Create visuals directory
import os
os.makedirs('dashboard-visuals', exist_ok=True)

# Visualization 1: Sector comparison
plt.figure(figsize=(12,8))
sns.barplot(x='Sector', y='Consumption', hue='Year', data=df)
plt.title('Energy Consumption by Sector (2024 vs 2025)')
plt.savefig('dashboard-visuals/sector_comparison.png')
plt.close()

# Visualization 2: Trend analysis
plt.figure(figsize=(14,7))
sns.lineplot(x='Year', y='Consumption', hue='Sector', data=df)
plt.title('Energy Consumption Trends Over Time')
plt.savefig('dashboard-visuals/trend_analysis.png')
plt.close()

# Visualization 3: Correlation heatmap
plt.figure(figsize=(10,8))
sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
plt.title('Metric Correlation Heatmap')
plt.savefig('dashboard-visuals/correlation_heatmap.png')
plt.close()

print("\nDashboard visuals saved in 'dashboard-visuals' directory")