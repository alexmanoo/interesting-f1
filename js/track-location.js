csv_data.then(() => {
    let trackLocations = loadTrackLocations();

    // Setup graph dimensions and margins
    const graphDimensions = {
        margin: { top: 10, right: 30, bottom: 20, left: 50 },
        width: 1280,
        height: 250,
    };
    const { width, height, margin } = graphDimensions;
    const adjustedWidth = width - margin.left - margin.right;
    const adjustedHeight = height - margin.top - margin.bottom;

    // Initialize SVG canvas
    const svg = initializeTLCanvas(
        "#track_location",
        adjustedWidth,
        adjustedHeight,
        margin
    );

    // Setup color palette
    const colorPalette = d3.scaleOrdinal().domain(["count"]).range(["#377eb8"]);

    // Initialize Axes
    const xScale = d3.scaleBand().range([0, adjustedWidth]).padding(0.2);
    const yScale = d3.scaleLinear().range([adjustedHeight, 0]);
    initializeTLAxes(svg, adjustedHeight, xScale, yScale);

    // Initialize Tooltip
    const tooltip = initializeTLTooltip("#track_location");

    // Create and update the graph
    updateTLChart(
        trackLocations,
        svg,
        colorPalette,
        xScale,
        yScale,
        tooltip,
        adjustedHeight
    );

    const changeTrackLocations = () => {
        trackLocations = loadTrackLocations();
        updateTLChart(
            trackLocations,
            svg,
            colorPalette,
            xScale,
            yScale,
            tooltip,
            adjustedHeight
        );
    }

    // Slider event handling
    slider.onTouchEnd(changeTrackLocations);
    yearPicker.onChange(changeTrackLocations);
});

// Functions for initializing SVG, Axes, Tooltip, and Graph Update
function initializeTLCanvas(selector, width, height, margin) {
    return d3
        .select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

function initializeTLAxes(svg, height, xScale, yScale) {
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(xScale));
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).tickFormat(d3.format("d")));
}

function initializeTLTooltip(selector) {
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

function updateTLChart(
    data,
    svg,
    color,
    xScale,
    yScale,
    tooltip,
    adjustedHeight
) {
    // Update the X and Y axes
    const raceNames = Array.from(new Set(data.map((d) => d.track_location)));
    xScale.domain(raceNames);
    yScale.domain([0, d3.max(data, (d) => d.count)]);

    svg.select(".x-axis").call(d3.axisBottom(xScale).tickSizeOuter(0));
    // svg.select(".y-axis").call(d3.axisLeft(yScale));
    svg.select(".y-axis")
    .call(d3.axisLeft(yScale)
          .tickFormat(d3.format("d")) // Ensure integer formatting
          .ticks(d3.max(data, (d) => d.count)) // Adjust tick count based on data
    );

    // Stack the data
    const subgroups = ["count"];
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
        .attr("x", (d) => xScale(d.data.track_location))
        .attr("width", xScale.bandwidth())
        .attr("y", adjustedHeight)
        .attr("height", 0)
        .on("mouseover", (event, d) =>
            mouseoverHandlerSafety(event, d, tooltip)
        )
        .on("mousemove", (event, d) =>
            mousemoveHandlerSafety(event, d, tooltip)
        )
        .on("mouseleave", () => mouseleaveHandlerSafety(tooltip))
        .transition()
        .duration(800) // Set the duration of the transition
        .attr("y", (d) => yScale(d[1]))
        .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
        .delay((d, i) => i * 100); // Optional: stagger the animations
}

function loadTrackLocations() {
    const groupDataByRace = (data) => {
        return data.reduce((acc, curr) => {
            const raceName = curr.name;
            if (!acc[raceName]) {
                acc[raceName] = [];
            }
            acc[raceName].push(curr);
            return acc;
        }, {});
    };

    const countEventsPerRace = (groupedData) => {
        return Object.entries(groupedData).map(([raceName, events]) => ({
            track_location: raceName.replace("Grand Prix", "").trim(),
            count: events.length,
        }));
    };

    let selectedRaces = current_raceIds.map((r_id) => {
        return races_dict[r_id];
    });

    const trackLocations = countEventsPerRace(groupDataByRace(selectedRaces));

    return trackLocations;
}
