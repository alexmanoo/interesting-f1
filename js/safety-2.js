csv_data.then(() => {
  // Initialize data and graph
  let safetyData = loadSafetyData(min_rating, max_rating);

  // Setup graph dimensions and margins
  const graphDimensions = {
    margin: { top: 10, right: 30, bottom: 20, left: 50 },
    width: 1700,
    height: 400,
  };
  const { width, height, margin } = graphDimensions;
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  // Initialize SVG canvas
  const svg = initializeSafetyCanvas(
    "#safety_stackedbarchart",
    adjustedWidth,
    adjustedHeight,
    margin
  );

  // Setup color palette
  const colorPalette = d3
    .scaleOrdinal()
    .domain(["safety_car", "red_flag"])
    .range(["#377eb8", "#e41a1c"]);

  // Initialize Axes
  const xScale = d3.scaleBand().range([0, adjustedWidth]).padding(0.2);
  const yScale = d3.scaleLinear().range([adjustedHeight, 0]);
  initializeSafetyAxes(svg, adjustedHeight, xScale, yScale);

  // Initialize Tooltip
  const tooltip = initializeSafetyTooltip("#safety_stackedbarchart");

  // Create and update the graph
  updateSafetyChart(safetyData, svg, colorPalette, xScale, yScale, tooltip, adjustedHeight);

  // Slider event handling
  slider.onChange((newRange) => {
    safetyData = loadSafetyData(newRange.begin, newRange.end);
    updateSafetyChart(safetyData, svg, colorPalette, xScale, yScale, tooltip, adjustedHeight);
  });
});

// Functions for initializing SVG, Axes, Tooltip, and Graph Update
function initializeSafetyCanvas(selector, width, height, margin) {
  return d3
    .select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

function initializeSafetyAxes(svg, height, xScale, yScale) {
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x-axis")
    .call(d3.axisBottom(xScale));
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat(d3.format("d")));
}

function initializeSafetyTooltip(selector) {
  return d3
    .select(selector)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("width", "120px");
}

function updateSafetyChart(data, svg, color, xScale, yScale, tooltip, adjustedHeight) {
  // Update the X and Y axes
  const raceNames = Array.from(new Set(data.map((d) => d.race_name)));
  xScale.domain(raceNames);
  yScale.domain([0, d3.max(data, (d) => d.safety_car + d.red_flag)]);

  svg.select(".x-axis").call(d3.axisBottom(xScale).tickSizeOuter(0));
  svg.select(".y-axis").call(d3.axisLeft(yScale));

  // Stack the data
  const subgroups = ["safety_car", "red_flag"];
  const stackedData = d3.stack().keys(subgroups)(data);

  // Update bars
  const barGroups = svg
    .selectAll(".barGroup")
    .data(stackedData)
    .join("g")
    .attr("class", "barGroup")
    .attr("fill", (d) => color(d.key));

  barGroups
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => xScale(d.data.race_name))
    .attr("width", xScale.bandwidth())
    // .attr("y", (d) => yScale(d[1]))
    // .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
    .attr("y", (d) => adjustedHeight)
    .attr("height", 0)
    .on("mouseover", (event, d) => mouseoverHandlerSafety(event, d, tooltip))
    .on("mousemove", (event, d) => mousemoveHandlerSafety(event, d, tooltip))
    .on("mouseleave", () => mouseleaveHandlerSafety(tooltip))
    .transition()
    .duration(800) // Set the duration of the transition
    .attr("y", (d) => yScale(d[1]))
    .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
    .delay((d, i) => i * 100); // Optional: stagger the animations
  
}

// Mouse event handlers for the tooltip
function mouseoverHandlerSafety(event, data, tooltip) {
  const subgroupName = d3.select(event.currentTarget.parentNode).datum().key;
  const subgroupValue = data.data[subgroupName];
  tooltip
    .html(`Type: ${subgroupName}<br>Value: ${subgroupValue}`)
    .style("opacity", 1);
}

function mousemoveHandlerSafety(event, data, tooltip) {
  tooltip
    .style("transform", "translateY(-55%)")
    .style("left", `${event.x / 4}px`)
    .style("top", `${event.y / 4 - 30}px`);
}

function mouseleaveHandlerSafety(tooltip) {
  tooltip.style("opacity", 0);
}

function loadSafetyData(min_rating = 0, max_rating = 10) {
  const filterAndSortData = (data) =>
    data
      .filter(
        (d) =>
          !isNaN(parseFloat(d.rating)) &&
          parseFloat(d.rating) >= min_rating &&
          parseFloat(d.rating) <= max_rating
      )
      .sort((a, b) => a.rating - b.rating);

  const groupDataByRace = (data) => {
    return data.reduce((acc, curr) => {
      const raceName = curr.race_name;
      if (!acc[raceName]) {
        acc[raceName] = [];
      }
      acc[raceName].push(curr);
      return acc;
    }, {});
  };

  const countEventsPerRace = (groupedData) => {
    return Object.entries(groupedData).map(([raceName, events]) => ({
      race_name: raceName,
      count: events.length,
    }));
  };

  const combineSafetyCarsAndRedFlags = (safetyCars, redFlags) => {
    return safetyCars.map((sc) => ({
      race_name: sc.race_name.replace("Grand Prix", "GP").trim(),
      safety_car: sc.count,
      red_flag: (
        redFlags.find((rf) => rf.race_name === sc.race_name) || { count: 0 }
      ).count,
    }));
  };

  const filteredSafetyCars = filterAndSortData(safety_cars);
  const groupedSafetyCars = groupDataByRace(filteredSafetyCars);
  const safetyCarsPerRace = countEventsPerRace(groupedSafetyCars);

  const filteredRedFlags = filterAndSortData(red_flags);
  const groupedRedFlags = groupDataByRace(filteredRedFlags);
  const redFlagsPerRace = countEventsPerRace(groupedRedFlags);

  return combineSafetyCarsAndRedFlags(safetyCarsPerRace, redFlagsPerRace);
}
