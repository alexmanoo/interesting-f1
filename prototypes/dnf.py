import pandas as pd

# Load the dataset
df = pd.read_csv('data/pit_stops.csv')

# Group by 'raceId' and sum up the 'stop_count' for each group
result_df = df.groupby('raceId')['stop'].sum().reset_index()

# Save the result to a new CSV file
result_df.to_csv('data/pit_stops_total.csv', index=False)

print("New CSV file created with total stop count for each raceId.")
