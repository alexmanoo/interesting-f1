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
  // time_diffs = time_diffs.slice(10000, 10700);
  // Provide types for each column for all data
  console.log(time_diffs[0])
  time_diffs.forEach(function (d) {
    d.raceId = +d.raceId;
    d.lap = +d.lap;
    d.p1_p2 = +d.p1_p2;
    d.p2_p3 = +d.p2_p3;
    d.p1_last = +d.p1_last;
  });
  console.log(time_diffs[0])
  safety_cars.forEach(function (d) {
    d.raceId = +d.raceId;
    d.count = +d.count;
  });



  races_dict = createRacesDict();
  initSlider();
});

function initSlider() {
  slider = createD3RangeSlider(0, 10, "#slider-container");
  d3.select("#range-label").text(slider.range().begin + " - " + slider.range().end);
  slider.onChange(onChangeSlider);
}

function onChangeSlider(newRange) {
  d3.select("#range-label").text(newRange.begin + " - " + newRange.end);
  min_rating = newRange.begin;
  max_rating = newRange.end;

  // // Get the indices from races.csv that have a rating between min_rating and max_rating
  // races.forEach(function (d) {
  //   if (d.rating >= min_rating && d.rating <= max_rating) {
      
  //   } else {
  //     d.show = false;
  //   }
  // }
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
  })

  return r_dict;


  function getFilteredRaceIds(min_rating, max_rating) {
    let res = []

    races_dict.forEach(function (d) {
      if (d.rating >= min_rating && d.rating <= max_rating) {
        res.push(d.raceId);
      }
    });

    return res;
  }
}