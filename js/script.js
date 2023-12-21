let races;
let race_ratings;
let races_dict;
let safety_cars;
let red_flags;
let time_diffs;
let min_rating = 8.0;
let max_rating = 10.0;
let slider;
let current_raceIds;
let current_raceIds_allYears;
let overtakes;
let pitstops;
let tire_types;
let all_years = [
    2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
    2020, 2021, 2022, 2023,
];
let selected_years = [
    // 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
    2020, 2021, 2022, 2023,
];
let yearPicker;

let csv_data = Promise.all([
    d3.csv("../data/races.csv"), // 1
    d3.csv("../data/race_ratings_with_race_ids.csv"), // 2
    d3.csv("../data/safety_cars_with_race_ids.csv"), // 3
    d3.csv("../data/red_flags_with_race_ids.csv"), // 4
    d3.csv("../data/time_diffs.csv"), // 5
    d3.csv("../data/overtakes_with_ids.csv"), // 6
    d3.csv("../data/pit_stops_total.csv"), // 7
    d3.csv("../data/tire_types.csv"), // 8
    d3.csv("../data/finish_status_with_ids.csv"), // 9
    d3.csv("../data/results_with_champ_pos.csv"), // 10
    d3.csv("../data/races_when.csv"), // 11
]).then(function (data) {
    processAndParseData(data);

    races_dict = createRacesDict();
    current_raceIds = getFilteredRaceIds(
        min_rating,
        max_rating,
        selected_years
    );
    current_raceIds_allYears = getFilteredRaceIds(
        min_rating,
        max_rating,
        all_years
    );

    updateCurrentRacesCount();
    initSlider();
    initYearPicker();
});

function initSlider() {
    slider = createD3RangeSlider(0.0, 10.0, "#slider-container");

    slider.range(min_rating, max_rating);

    d3.select("#range-label").text(
        slider.range().begin + " - " + slider.range().end
    );

    slider.onChange(onChangeSlider);
}

function initYearPicker() {
    yearPicker = createYearPicker();
    yearPicker.onChange(updateChartData);
    slider.onTouchEnd(createYearPicker);
}

function onChangeSlider(newRange) {
    d3.select("#range-label").text(newRange.begin + " - " + newRange.end);
    min_rating = newRange.begin;
    max_rating = newRange.end;
    updateChartData();
}

function updateChartData() {
    current_raceIds = getFilteredRaceIds(
        min_rating,
        max_rating,
        selected_years
    );
    current_raceIds_allYears = getFilteredRaceIds(
        min_rating,
        max_rating,
        all_years
    );
    updateCurrentRacesCount();
    showWarning();
}

function createRacesDict() {
    // Take races data and create a dictionary with raceId as key
    let r_dict = {};
    races.forEach(function (d) {
        if (d.raceId == 1100 || d.raceId == 1039) return;

        r_dict[d.raceId] = d;
    });

    race_ratings.forEach(function (d) {
        if (d.raceId == 1100 || d.raceId == 1039) return;
        // Add race rating to r_dict for races that have a rating
        r_dict[d.raceId].rating = +d["RATING"];
    });

    return r_dict;
}

function getFilteredRaceIds(min_rating, max_rating, selected_years) {
    let res = [];

    for (const [raceId, race_details] of Object.entries(races_dict)) {
        if (
            race_details.rating >= min_rating &&
            race_details.rating <= max_rating &&
            selected_years.includes(parseInt(race_details.year))
        ) {
            res.push(+raceId);
        }
    }

    return res;
}

function updateCurrentRacesCount() {
    document.getElementById("current-races-count").textContent =
        "Number of races in your selection: " +
        current_raceIds.length +
        ". Races are between years: " +
        getMinMaxYear();
}

function showWarning() {
    if (current_raceIds.length == 0) {
        document.getElementById("warning").style.display = "block";
        document.getElementById("main-container").style.display = "none";
    } else {
        document.getElementById("warning").style.display = "none";
        document.getElementById("main-container").style.display = "block";
    }
}

function getMinMaxYear() {
    let min_year = 3000;
    let max_year = 0;

    current_raceIds.forEach(function (d) {
        let yr = races_dict[d].year;
        if (yr < min_year) {
            min_year = yr;
        }
        if (yr > max_year) {
            max_year = yr;
        }
    });
    return min_year + " - " + max_year;
}

function processAndParseData(data) {
    races = data[0];
    race_ratings = data[1];
    safety_cars = data[2];
    red_flags = data[3];
    time_diffs = data[4];
    overtakes = data[5];
    pitstops = data[6];
    tire_types = data[7];
    finish_stats = data[8];
    results_with_champ_pos = data[9];
    races_when = data[10];

    time_diffs.forEach(function (d) {
        d.raceId = +d.raceId;
        d.lap = +d.lap;
        d.p1_p2 = +d.p1_p2;
        d.p2_p3 = +d.p2_p3;
        d.p1_last = +d.p1_last;
    });
    safety_cars.forEach(function (d) {
        d.raceId = +d.raceId;
        d.count = +d.count;
    });
    overtakes.forEach(function (d) {
        d.Overtakes = +d.Overtakes;
        d.raceId = +d.raceId;
    });
    pitstops.forEach(function (d) {
        d.raceId = +d.raceId;
        d.stop = +d.stop;
    });
    finish_stats.forEach(function (d) {
        d.raceId = +d.raceId;
        d.Finished = +d.Finished;
        d.Disqualified = +d.Disqualified;
        d.Accident = +d.Accident;
        d.Collision = +d.Collision;
        d.Spunoff = +d.Spunoff;
        d.Engine = +d.Engine;
        d.Gearbox = +d.Gearbox;
        d.Transmission = +d.Transmission;
        d.Clutch = +d.Clutch;
        d.Hydraulics = +d.Hydraulics;
        d.Electrical = +d.Electrical;
        d.Radiator = +d.Radiator;
        d.Suspension = +d.Suspension;
        d.Brakes = +d.Brakes;
        d.Differential = +d.Differential;
        d.Overheating = +d.Overheating;
        d.Mechanical = +d.Mechanical;
        d.Tyre = +d.Tyre;
        d.DriverSeat = +d.DriverSeat;
        d.Puncture = +d.Puncture;
        d.Driveshaft = +d.Driveshaft;
        d.Lap1 = +d.Lap1;
        d.Laps2 = +d.Laps2;
        d.Laps3 = +d.Laps3;
        d.Laps4 = +d.Laps4;
        d.Laps5 = +d.Laps5;
        d.Laps6 = +d.Laps6;
        d.Laps7 = +d.Laps7;
        d.Laps8 = +d.Laps8;
        d.Laps9 = +d.Laps9;
    });
}
