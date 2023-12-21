# When is Formula 1 interesting?
This repo contains the code for Assignment 1 of the Data Visualisation course.

Group 13: 
- Jesper Dalgaard
- Tim den Blanken
- Alex Manolache

## Usage
### Visualisation
Make sure you have a live server running in the root of the repo. For example, using the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code.
Open the `index.html` file in a browser.

### Data analysis
Activate the conda environment: 
```
conda activate interesting-f1
```
Run scripts in `data_scripts` folder. For example, to run the `main.py`: 
```
python main.py
```

## Installation
Clone the repo and install the conda environment:
```
mamba env create -f environment_interesting_f1.yaml
```
D3.js is used for the visualisation. The library is included in the repo.

## Structure
The repo is structured as follows:
- `data_scripts`: Contains the scripts used to analyse, process and clean the data.
- `data`: Contains the CSV data used for the visualisation.
- `index.html`: The main html file for the visualisation.
- `style.css`: The css file with all the styling.
- `js`: Folder containing all charts specific javascript files, the main javascript file and the d3 library.


