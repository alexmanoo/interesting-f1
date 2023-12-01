import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# read csv file to pandas dataframe
df = pd.read_csv('../data/tire_types.csv', sep=',')

# print all unique tire types
tire_types = df['tires'].unique()

# split all tire types into 6 categories: soft, medium, hard, intermediate, wet, NA
soft = ["Soft", "Soft New", "Soft Used"]
medium = ["Medium", "Medium New", "Medium Used"]
hard = ["Hard", "Hard New", "Hard Used"]
intermediate = ["Intermediate", "Intermediate New", "Intermediate Used"]
wet = ["Wet", "Wet New", "Wet Used"]
other = ["Other", "Supersoft New", "Supersoft Used", "Ultrasoft New", "Ultrasoft Used", "HyperSoft New", "HyperSoft Used"]
tire_categories = [soft, medium, hard, intermediate, wet, other]

# enter datarange
start_year = 2012
end_year = 2023

# first get part of dataframe that we will use
df = df[(df['year'] >= start_year) & (df['year'] <= end_year)]
total_laps = np.sum(df['laps'])

# print percentage of laps driven on each tire category
for category in tire_categories:
    laps = np.sum(df[df['tires'].isin(category)]['laps'])
    print(f"{category[0]}: {laps / total_laps * 100:.2f}%")

# create pie chart
sizes = []
labels = []
for category in tire_categories:
    laps = np.sum(df[df['tires'].isin(category)]['laps'])
    sizes.append(laps)
    labels.append(category[0])

fig1, ax1 = plt.subplots()
ax1.pie(sizes, labels=labels, autopct='%1.1f%%')
ax1.axis('equal')
plt.title(f"Laps driven on each tire category in {start_year} - {end_year}")
plt.show()
