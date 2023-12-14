let races;
let race_ratings;
// races_dict containing race details (from races.csv) and ratings
let races_dict;
let safety_cars;
let red_flags;
let time_diffs;
let min_rating = 0;
let max_rating = 10;
let slider;
let current_raceIds;
let overtakes;
let pitstops;
let tire_types;

let csv_data = Promise.all([
    d3.csv("../data/races.csv"),
    d3.csv("../data/race_ratings_with_race_ids.csv"),
    d3.csv("../data/safety_cars_with_race_ids.csv"),
    d3.csv("../data/red_flags_with_race_ids.csv"),
    d3.csv("../data/time_diffs.csv"),
    d3.csv("../data/overtakes_with_ids.csv"),
    d3.csv("../data/pit_stops_total.csv"),
    d3.csv("../clean_data/tire_types.csv"),
    d3.csv("../data/finish_status_with_ids.csv"),
]).then(function (data) {
    races = data[0];
    race_ratings = data[1];
    safety_cars = data[2];
    red_flags = data[3];
    time_diffs = data[4];
    overtakes = data[5];
    pitstops = data[6];
    tire_types = data[7];
    finish_stats = data[8];

    // Take only first 5000 data points
    // time_diffs = time_diffs.slice(10000, 10700);
    // Provide types for each column for all data
    console.log(time_diffs[0]);
    time_diffs.forEach(function (d) {
        d.raceId = +d.raceId;
        d.lap = +d.lap;
        d.p1_p2 = +d.p1_p2;
        d.p2_p3 = +d.p2_p3;
        d.p1_last = +d.p1_last;
    });
    console.log(time_diffs[0]);
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
        // Continue updating other properties similarly
        // root.children[1].children[3].children[9].value += +d.SomeOtherProperty;
    });
    races_dict = createRacesDict();
    current_raceIds = getFilteredRaceIds(min_rating, max_rating);
    initSlider();
});

function initSlider() {
    slider = createD3RangeSlider(0, 10, "#slider-container");
    d3.select("#range-label").text(
        slider.range().begin + " - " + slider.range().end
    );
    slider.onChange(onChangeSlider);
}

function onChangeSlider(newRange) {
    d3.select("#range-label").text(newRange.begin + " - " + newRange.end);
    min_rating = newRange.begin;
    max_rating = newRange.end;
    current_raceIds = getFilteredRaceIds(min_rating, max_rating);
}

function createRacesDict() {
    // Take races data and create a dictionary with raceId as key
    let r_dict = {};
    races.forEach(function (d) {
        r_dict[d.raceId] = d;
    });

    race_ratings.forEach(function (d) {
        // Add race rating to r_dict for races that have a rating
        r_dict[d.raceId].rating = +d["RATING"];
    });

    return r_dict;
}

function getFilteredRaceIds(min_rating, max_rating) {
    let res = [];

    for (const [raceId, race_details] of Object.entries(races_dict)) {
        if (
            race_details.rating >= min_rating &&
            race_details.rating <= max_rating
        ) {
            res.push(+raceId);
        }
    }

    // races_dict.forEach(function (d) {
    //     if (d.rating >= min_rating && d.rating <= max_rating) {
    //       console.log(d["raceId"].raceId)
    //         res.push(d["raceId"].raceId);
    //     }
    // });

    return res;
}
