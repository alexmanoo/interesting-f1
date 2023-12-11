csv_data.then(() => {
  let safetyData = updateSafetyData();

  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 20, left: 50 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#safety_stackedbarchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // List of subgroups = header of the csv files = soil condition here
  var subgroups = ["safety_car", "red_flag"];

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  // var groups = d3.map(data, function(d){return(d.group)}).keys()
  var groups = d3.group(safetyData, (d) => d.race_name).keys();

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 20]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // color palette = one color per subgroup
  const color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range(["#377eb8", "#e41a1c"]);

  //stack the data? --> stack per subgroup
  const stackedData = d3.stack().keys(subgroups)(safetyData);

  // ----------------
  // Create the tooltip
  // ----------------
  const tooltip = d3
    .select("#safety_stackedbarchart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("width", "120px");

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function (event, d) {
    const subgroupName = d3.select(this.parentNode).datum().key;
    const subgroupValue = d.data[subgroupName];
    tooltip
      .html("Type: " + subgroupName + "<br>" + "Value: " + subgroupValue)
      .style("opacity", 1);
  };
  const mousemove = function (event, d) {
    tooltip
      .style("transform", "translateY(-55%)")
      .style("left", event.x / 4 + "px")
      .style("top", event.y / 4 - 30 + "px");
  };
  const mouseleave = function (event, d) {
    tooltip.style("opacity", 0);
  };

  // Show the bars
  svg
    .append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.race_name))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  function updateSafetyData() {
    let filteredSafetyCars = safety_cars
      .filter(function (d) {
        return (
          parseFloat(d.rating) != NaN &&
          parseFloat(d.rating) >= min_rating &&
          parseFloat(d.rating) <= max_rating
        );
      })
      .sort((a, b) => a.rating - b.rating);

    // Calculate the number of safety cars per race_name
    let safetyCarsDetailsPerRace = Object.groupBy(
      filteredSafetyCars,
      ({ race_name }) => race_name
    );

    let safetyCarsPerRace = Object.entries(safetyCarsDetailsPerRace).map(
      ([r, details]) => {
        return { race_name: r, safety_cars: details.length };
      }
    );

    let filteredRedFlags = red_flags.filter(function (d) {
      return (
        parseFloat(d.rating) != NaN &&
        parseFloat(d.rating) >= min_rating &&
        parseFloat(d.rating) <= max_rating
      );
    });

    let redFlagsDetailsPerRace = Object.groupBy(
      filteredRedFlags,
      ({ race_name }) => race_name
    );
    let redFlagsPerRace = Object.entries(redFlagsDetailsPerRace).map(
      ([r, details]) => {
        return { race_name: r, red_flags: details.length };
      }
    );

    let safetyData = safetyCarsPerRace.map((d) => {
      return {
        race_name: d.race_name,
        safety_car: d.safety_cars,
        red_flag: redFlagsPerRace.filter((r) => r.race_name == d.race_name)
          .length,
      };
    });

    return safetyData;
  }

  function updateGraph(safetyData) {
  }

  slider.onChange(function (newRange) {
    onChangeSlider(newRange);
    safetyData = updateSafetyData();
    updateGraph(safetyData);
  });
});
