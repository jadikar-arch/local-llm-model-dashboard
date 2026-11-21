import pandas as pd
import plotly.express as px

# Load data
data = pd.read_csv('/Users/munirdin/Documents/projects/app-to-git/dashboard-project/data/real-data.csv')

# Create interactive dashboard
fig = px.line(data, x='year', y=['chat_count', 'user_count'], title='Yearly Chat and User Trends')
fig.update_layout(xaxis_title='Year', yaxis_title='Count')

# Save as static HTML file
fig.write_html('/Users/munirdin/Documents/projects/app-to-git/dashboard-project/output/yearly_dashboard.html')