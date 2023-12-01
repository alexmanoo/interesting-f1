import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# read csv file to pandas dataframe
df = pd.read_csv('../data/races.csv', sep=',')

# create line chart with on y-axis number of races and on x-axis the round number (i.e. the number of the race in the season)
start_year = 1950
end_year = 2023

# first get part of dataframe that we will use
df = df[(df['year'] >= start_year) & (df['year'] <= end_year)]
races = np.zeros(df['round'].max())
race_n = [i for i in range(1, df['round'].max() + 1)]

for i in range(len(races)):
    races[i] = len(df[df['round'] == i+1])

# plotting line chart
plt.figure()
plt.plot(race_n, races, color='red', marker='o', linestyle='solid')
plt.xlabel('Round number')
plt.ylabel('# of races')
plt.title('Number of races per round in ' + str(start_year) + ' - ' + str(end_year))
plt.xticks(np.arange(0, len(race_n)+1, step=1))
plt.show()