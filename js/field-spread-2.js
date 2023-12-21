let selectedColumn = "p1_p2";
csv_data.then(() => {
    function updateChart(time_diffs, selectedColumn = "p1_p2") {
        // Clear existing content
        d3.select("#time_diffs").select("svg").remove();

        // Specify the chart’s dimensions.
        const width = 600;
        const height = 500;
        const marginTop = 80;
        const marginRight = 20;
        const marginBottom = 30;
        const marginLeft = 50;

        // Create the positional scales.
        const x = d3
            .scaleLinear()
            .domain([0, d3.max(time_diffs, (d) => d.lap)])
            .range([marginLeft, width - marginRight]);

        const y = d3
            .scaleLinear()
            .domain(d3.extent(time_diffs, (d) => d[selectedColumn]))
            .nice()
            .range([height - marginBottom, marginTop]);

        // Create the SVG container.
        const svg = d3
            .select("#time_diffs")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        // Add the axes
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0)
            )
            .append("text")
            .attr("x", width - marginRight)
            .attr("y", -4)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text("Lap →");

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y))
            .select(".domain")
            .remove()
            .append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Time Difference (s)");

        // Compute the points in pixel space as [x, y, z], where z is the name of the series.
        const points = time_diffs.map((d) => {
            let race = races_dict[d.raceId];
            return [
                x(d.lap),
                y(d[selectedColumn]),
                race.year + " " + race.name,
            ];
        });

        // Group the points by series.
        const groups = d3.rollup(
            points,
            (v) => Object.assign(v, { z: v[0][2] }),
            (d) => d[2]
        );

        // Draw the lines.
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const line = d3.line();
        const path = svg
            .append("g")
            .attr("fill", "none")
            // .attr("stroke", "crimson")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll("path")
            .data(groups.values())
            .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("stroke", (d) => color(d.z))
            .attr("d", line);

        // Add an invisible layer for the interactive tip.
        const dot = svg.append("g").attr("display", "none");

        dot.append("circle").attr("r", 2.5);

        dot.append("text").attr("text-anchor", "middle").attr("y", -8);

        svg.on("pointerenter", pointerentered)
            .on("pointermove", pointermoved)
            .on("pointerleave", pointerleft)
            .on("touchstart", (event) => event.preventDefault());

        // When the pointer moves, find the closest point, update the interactive tip, and highlight
        // the corresponding line.
        function pointermoved(event) {
            const [xm, ym] = d3.pointer(event);
            const i = d3.leastIndex(points, ([x, y]) =>
                Math.hypot(x - xm, y - ym)
            );
            const [x, y, k] = points[i];
            path.style("stroke", ({ z }) => (z === k ? null : "#ddd"))
                .filter(({ z }) => z === k)
                .raise();
            dot.attr("transform", `translate(${x},${y})`);
            dot.select("text").text(k);
            svg.property("value", time_diffs[i]).dispatch("input", {
                bubbles: true,
            });
        }

        function pointerentered() {
            path.style("mix-blend-mode", null).style("stroke", "#ddd");
            dot.attr("display", null);
        }

        function pointerleft() {
            path.style("mix-blend-mode", "multiply").style("stroke", null);
            dot.attr("display", "none");
            svg.node().value = null;
            svg.dispatch("input", { bubbles: true });
        }

        // Add title to the graph
        svg.append("text")
            .attr("x", marginLeft)
            .attr("y", 20) // Adjust this value if needed
            .attr("text-anchor", "left")
            .style("font-size", "22px")
            .text("Field spread"); // Replace with your actual title

        // Add subtitle to the graph
        svg.append("text")
            .attr("x", marginLeft)
            .attr("y", 40) // Adjust this value if needed
            .attr("text-anchor", "left")
            .style("font-size", "14px")
            .style("fill", "grey")
            .style("max-width", 400)
            .text("Shows the difference in seconds between drivers in position 1 (P1) and position 2 (P2)"); // Replace with your actual subtitle

        svg.append("text")
            .attr("x", marginLeft)
            .attr("y", 60) // Adjust this value if needed
            .attr("text-anchor", "left")
            .style("font-size", "14px")
            .style("fill", "grey")
            .style("max-width", 400)
            .text("on the y-axis and the lap number on the x-axis."); // Replace with your actual subtitle
    }

    const onChangeSliderFS = (selectedColumn) => {
        const filteredTimeDiffs = time_diffs.filter((d) => {
            // Filter out if d.raceId is not in the current_raceIds

            return current_raceIds.includes(parseInt(d.raceId));
        });
        updateChart(filteredTimeDiffs, selectedColumn);
    };

    // Initial call to updateChart
    onChangeSliderFS(selectedColumn);

    // Slider or any other mechanism to change min_rating and max_rating
    // On change of these values, call updateChart with the new filtered data
    slider.onTouchEnd(() => onChangeSliderFS(selectedColumn));
    yearPicker.onChange(() => onChangeSliderFS(selectedColumn));

    // Event listeners for buttons
    d3.select("#btn-p1-p2").on("click", () => {
        selectedColumn = "p1_p2";
        onChangeSliderFS(selectedColumn);
    });

    d3.select("#btn-p2-p3").on("click", () => {
        selectedColumn = "p2_p3";
        onChangeSliderFS(selectedColumn);
    });

    d3.select("#btn-p1-last").on("click", () => {
        selectedColumn = "p1_last";
        onChangeSliderFS(selectedColumn);
    });
});
