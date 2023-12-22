csv_data.then(() => {
    let trackLocations = loadTrackLocations();

    // Setup graph dimensions and margins
    const graphDimensions = {
        margin: { top: 80, right: 30, bottom: 95, left: 50 },
        width: 1280,
        height: 350,
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
    };

    // Slider event handling
    slider.onTouchEnd(changeTrackLocations);
    yearPicker.onChange(changeTrackLocations);
});

// Functions for initializing SVG, Axes, Tooltip, and Graph Update
function initializeTLCanvas(selector, width, height, margin) {
    const svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add title to the graph
    svg.append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("Track Location");

    // Add subtitle to the graph
    svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text(
            "Shows number of races from your selection grouped per circuit location."
        );

    return svg;
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
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");
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
    const raceNames = Array.from(new Set(data.map((d) => d.track_location)));
    xScale.domain(raceNames);
    yScale.domain([0, d3.max(data, (d) => d.count)]);

    svg.select(".x-axis").call(d3.axisBottom(xScale).tickSizeOuter(0));
    svg.select(".x-axis")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-70)");
    svg.select(".y-axis").call(
        d3
            .axisLeft(yScale)
            .tickFormat(d3.format("d"))
            .ticks(d3.max(data, (d) => d.count))
    );

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
        .on("mouseover", (event, d) => mouseoverHandlerTL(event, d, tooltip))
        .on("mousemove", (event, d) =>
            mousemoveHandlerSafety(event, d, tooltip)
        )
        .on("mouseleave", () => mouseleaveHandlerSafety(tooltip))
        .transition()
        .duration(800)
        .attr("y", (d) => yScale(d[1]))
        .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
        .delay((d, i) => i * 100);
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
            track_location: raceName.replace("Grand Prix", "GP").trim(),
            count: events.length,
        }));
    };

    let selectedRaces = current_raceIds.map((r_id) => {
        return races_dict[r_id];
    });

    const trackLocations = countEventsPerRace(groupDataByRace(selectedRaces));

    return trackLocations;
}

function mouseoverHandlerTL(event, data, tooltip) {
    const subgroupName = d3.select(event.currentTarget.parentNode).datum().key;
    const subgroupValue = data.data[subgroupName];
    tooltip.html(`Count: ${subgroupValue}`).style("opacity", 1);
}
