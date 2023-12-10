# Load data/lap_times.csv and calculate the time difference between each lap

import pandas as pd

# Load data
df = pd.read_csv('../data/lap_times.csv')

results = []

# Iterate through each raceId and race group
for race_id, race_group in df.groupby('raceId'):
    cumulative_times = {}

    for lap, lap_group in race_group.groupby('lap'):
        lap_group = lap_group.sort_values('position')
        positions = lap_group['position'].tolist()
        times = lap_group['milliseconds'].tolist()
        drivers = lap_group['driverId'].tolist()

        # Add the cumulative time for each driver
        for idx, driverId in enumerate(drivers):
            if driverId not in cumulative_times:
                cumulative_times[driverId] = 0
            row = lap_group[lap_group['driverId'] == driverId]
            cumulative_times[driverId] += int(row['milliseconds'])
        
        lap_result = {
            'raceId': race_id, 'lap': lap,
            'p1_p2': 0, 'p2_p3': 0, 'p1_last': 0,
        }

        if len(positions) > 2:
            p1_time = cumulative_times[drivers[0]]
            p2_time = cumulative_times[drivers[1]] if 2 in positions else 0
            p3_time = cumulative_times[drivers[2]] if 3 in positions else 0
            last_time = cumulative_times[drivers[-1]]

            lap_result.update({'p1_p2': round((p2_time - p1_time) / 1000, 3) if p2_time > 0 else 0,
                               'p2_p3': round((p3_time - p2_time) / 1000, 3) if p3_time > 0 else 0,
                               'p1_last': round((last_time - p1_time) / 1000, 3) if (last_time > 0 and last_time != p1_time) else 0})
        # Append the results to the results list
        results.append(lap_result)

# Create a dataframe from the results list
df = pd.DataFrame(results)
# Save the dataframe to a csv file
df.to_csv('../data/time_diffs.csv', index=False)
