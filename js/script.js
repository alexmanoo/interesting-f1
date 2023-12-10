let races;
let race_ratings;
let safety_cars;
let red_flags;
let time_diffs;
let min_rating = 0;
let max_rating = 10;

let csv_data = Promise.all([
  d3.csv(
    "../data/races.csv"
  ),
  d3.csv(
    "../data/race_ratings_with_race_ids.csv"
  ),
  d3.csv(
    "../data/safety_cars_with_race_ids.csv"
  ),
  d3.csv(
    "../data/red_flags_with_race_ids.csv"
  ),
  d3.csv(
    "../data/time_diffs.csv"
  ),
]).then(function (data) {
  races = data[0];
  race_ratings = data[1];
  safety_cars = data[2];
  red_flags = data[3];
  time_diffs = data[4];
  // Take only first 5000 data points
  time_diffs = time_diffs.slice(10000, 10700);
  // Provide types for each column for all data
  time_diffs.forEach(function (d) {
    d.raceId = +d.raceId;
    d.lap = +d.lap;
    d.p1_p2 = +d.p1_p2;
  });
});
