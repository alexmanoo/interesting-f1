csv_data.then(() => {
    let safetyData = loadSafetyData(min_rating, max_rating);

    const graphDimensions = {
        margin: { top: 90, right: 30, bottom: 20, left: 50 },
        width: 700,
        height: 500,
    };
    const { width, height, margin } = graphDimensions;
    const adjustedWidth = width - margin.left - margin.right;
    const adjustedHeight = height - margin.top - margin.bottom;

    const svg = initializeSafetyCanvas(
        "#safety_stackedbarchart",
        adjustedWidth,
        adjustedHeight,
        margin
    );

    const colorPalette = d3
        .scaleOrdinal()
        .domain(["safety_car", "red_flag"])
        .range(["#377eb8", "#e41a1c"]);

    const xScale = d3.scaleBand().range([0, adjustedWidth]).padding(0.2);
    const yScale = d3.scaleLinear().range([adjustedHeight, 0]);
    initializeSafetyAxes(svg, adjustedHeight, xScale, yScale);

    const tooltip = initializeSafetyTooltip("#safety_stackedbarchart");

    updateSafetyChart(
        safetyData,
        svg,
        colorPalette,
        xScale,
        yScale,
        tooltip,
        adjustedHeight
    );

    slider.onTouchEnd((newRange) => {
        safetyData = loadSafetyData(newRange.begin, newRange.end);
        updateSafetyChart(
            safetyData,
            svg,
            colorPalette,
            xScale,
            yScale,
            tooltip,
            adjustedHeight
        );
    });

    yearPicker.onChange(() => {
        safetyData = loadSafetyData(min_rating, max_rating);
        updateSafetyChart(
            safetyData,
            svg,
            colorPalette,
            xScale,
            yScale,
            tooltip,
            adjustedHeight
        );
    });
});

function initializeSafetyCanvas(selector, width, height, margin) {
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
        .text("Safety Cars and Red Flags");

    // Add subtitle to the graph
    svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text(
            "Shows number of SCs and RFs from your selection, grouped per circuit location."
        );
    return svg;
}

function initializeSafetyAxes(svg, height, xScale, yScale) {
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(xScale));
    svg.append("g")
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
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");
}

function updateSafetyChart(
    data,
    svg,
    color,
    xScale,
    yScale,
    tooltip,
    adjustedHeight
) {
    const raceNames = Array.from(new Set(data.map((d) => d.race_name)));
    xScale.domain(raceNames);
    yScale.domain([0, d3.max(data, (d) => d.safety_car + d.red_flag)]);

    svg.select(".x-axis").call(d3.axisBottom(xScale).tickSizeOuter(0));
    svg.select(".y-axis").call(
        d3.axisLeft(yScale).tickFormat(d3.format("d")).ticks(yScale.domain()[1])
    );

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
        .duration(800)
        .attr("y", (d) => yScale(d[1]))
        .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
        .delay((d, i) => i * 100);
}

// Mouse event handlers for the tooltip
function mouseoverHandlerSafety(event, data, tooltip) {
    const subgroupName = d3.select(event.currentTarget.parentNode).datum().key;
    const subgroupValue = data.data[subgroupName];
    tooltip.html(`${subgroupName}s: ${subgroupValue}`).style("opacity", 1);
}

function mousemoveHandlerSafety(event, data, tooltip) {
    tooltip
        .style("left", `${event.x + 30}px`)
        .style("top", `${event.y + 30}px`);
}

function mouseleaveHandlerSafety(tooltip) {
    tooltip.style("opacity", 0);
}

function loadSafetyData() {
    const filterAndSortData = (data) =>
        data.filter((d) => current_raceIds.includes(parseInt(d.raceId)));

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
                redFlags.find((rf) => rf.race_name === sc.race_name) || {
                    count: 0,
                }
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
