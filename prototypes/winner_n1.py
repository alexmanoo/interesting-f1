import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'

# read csv file to pandas dataframe
driver_standings = pd.read_csv('../data/driver_standings.csv', sep=',')
races = pd.read_csv('../data/races.csv', sep=',')
results = pd.read_csv('../data/results.csv', sep=',')
results_with_champ_pos = pd.read_csv('../data/results_with_champ_pos.csv', sep=',')

# enter datarange
start_year = 2021
end_year = 2021
results_with_champ_pos = results_with_champ_pos[(results_with_champ_pos['year'] >= start_year) & (results_with_champ_pos['year'] <= end_year)]

# for every race check if winner is n1 driver in the championship
n_races = len(results_with_champ_pos['raceId'].unique())
n1_wins = len(results_with_champ_pos[(results_with_champ_pos['position'] == "1") & (results_with_champ_pos['champ_pos'] == 1)])
n2_wins = len(results_with_champ_pos[(results_with_champ_pos['position'] == "1") & (results_with_champ_pos['champ_pos'] == 2)])
n3_wins = len(results_with_champ_pos[(results_with_champ_pos['position'] == "1") & (results_with_champ_pos['champ_pos'] == 3)])

# create bar chart and pie chart (subplots) showing the times the n1 driver won and the times n1 driver did not win
labels = ['n1 driver won', 'n2 driver won', 'n3 driver won', 'driver outside top 3 won']
data = [n1_wins, n2_wins, n3_wins, n_races-n1_wins-n2_wins-n3_wins]
colors = ['gold', 'silver', 'peru', 'royalblue']

# fig1, ax1 = plt.subplots()
# ax1.pie(data, labels=labels, autopct='%1.1f%%')
# ax1.axis('equal')
# plt.title(f"# times no1 driver won {start_year} - {end_year}")
# # plt.show()

fig2, ax2 = plt.subplots()
ax2.bar(labels, data, color=colors)
plt.title(f"# times no1 driver won {start_year} - {end_year}")
plt.show()


# # # some code to create .csv
# # create new dataframe from results, only keep raceId, driverId and grid
# results = results[['raceId', 'driverId', 'position']]

# # add a new column with position of driver in championship
# results['champ_pos'] = 0
# results['year'] = 0
# for i in range(len(results)):
#     raceId = results['raceId'][i]
#     driverId = results['driverId'][i]
#     champ_os = driver_standings[(driver_standings['raceId'] == raceId) & (driver_standings['driverId'] == driverId)]['position']
#     if len(champ_os) > 0:
#         results['champ_pos'].iloc[i] = champ_os.iloc[0]
#     year = races[(races['raceId'] == raceId)]['year']
#     results['year'].iloc[i] = year.iloc[0]

# # save to csv
# results.to_csv('results_with_champ_pos.csv', index=False)