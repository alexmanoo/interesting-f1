csv_data.then(() => {
    var tooltip = d3
        .select("#overtakes")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0);

    var margin = { top: 50, right: 50, bottom: 50, left: 40 },
        width = 750 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand().range([0, width]).padding(0.3);
    var y = d3.scaleLinear().range([height, 0]);

    var svg = d3
        .select("#overtakes")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Specify the desired IDs to include in the plot
    var desiredIDs = ["3", "4", "5"];

    // Title for the bar chart
    svg.append("text")
        .attr("x", width / 2 - 10)
        .attr("y", height * 1.1)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-family", "Helvetica")
        .style("font-weight", "bold") // Add bold style
        .text("Overtakes Count for Selected IDs");

    var filteredData;

    function updateHistrogram(bins) {
        // Listen to the slider?
        var range = 100;
        var incr = range / bins;

        // Initialize race counts with increments of 5
        var raceCounts = {};
        for (var i = 0; i < range - 1; i += incr) {
            raceCounts[`${Math.round(i)}-${Math.round(i + incr - 1)}`] = 0;
        }
        raceCounts[`${range}++`] = 0;

        filteredData.forEach(function (d) {
            // Find the appropriate range for Overtakes
            for (var i = 0; i < range; i += incr) {
                if (d.Overtakes >= i && d.Overtakes <= i + incr) {
                    raceCounts[
                        `${Math.round(i)}-${Math.round(i + incr - 1)}`
                    ]++;
                    break; // Break out of the loop once the range is found
                }
            }
            if (d.Overtakes > range) {
                raceCounts[`${range}++`]++;
            }
        });

        // Now, raceCounts will contain counts for each range of 5 from 0 to 50
        console.log(raceCounts);

        // Create an array of objects for the bar chart
        var barData = Object.keys(raceCounts).map(function (key) {
            return { category: key, count: raceCounts[key] };
        });

        // Define a custom color for the bars
        var barColor = d3
            .scaleOrdinal()
            .domain(
                barData.map(function (d) {
                    return d.category;
                })
            )
            .range(["#6277B2"]);

        x.domain(
            barData.map(function (d) {
                return d.category;
            })
        );
        y.domain([
            0,
            d3.max(barData, function (d) {
                return d.count;
            }),
        ]);
        svg.selectAll(".bar").remove();
        var maxY = d3.max(barData, function (d) {
            return d.count;
        });
        var bars = svg
            .selectAll(".bar")
            .data(barData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", x.bandwidth())
            .attr("y", function (d) {
                return y(d.count);
            })
            .attr("height", function (d) {
                return height - y(d.count);
            })
            .attr("x", function (d) {
                return x(d.category);
            })
            .attr("fill", function (d) {
                return barColor(d.category);
            })
            .on("mouseover", function (event, d) {
                // Get mouse position relative to the SVG container
                var [x, y] = d3.pointer(event);

                // Show tooltip on mouseover
                tooltip.transition().duration(200).style("opacity", 0.9);

                tooltip
                    .html("Range: " + d.category + "<br>Count: " + d.count);

                // Add a horizontal line on the bar
                svg.append("line")
                    .attr("class", "hover-line")
                    .transition()
                    .duration(300)
                    .style("opacity", 0.9)
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", height - (d.count / maxY) * height) // Corrected line
                    .attr("y2", height - (d.count / maxY) * height) // Corrected line
                    .attr("stroke", "red") // You can adjust the color as needed
                    .attr("stroke-width", 2);
            })
            .on("mouseout", function () {
                // Hide tooltip and remove the horizontal line on mouseout
                tooltip.transition().duration(500).style("opacity", 0);

                svg.selectAll(".hover-line").remove();
            });

        svg.selectAll("g").remove();

        var suck = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .transition()

            .call(d3.axisBottom(x).tickSize(0).tickFormat("")); // This will remove tick labels

        svg.append("g")

            // .transition()
            .call(d3.axisLeft(y));

        // Adjust font size for x-axis tick labels
        svg.selectAll(".tick text").style("font-size", "15px");
    }

    function changeRaceList() {
        // Filter data based on desired IDs
        filteredData = overtakes.filter(function (d) {
            return current_raceIds.includes(d.raceId);
        });
        updateHistrogram(12);
    }
    changeRaceList();
    updateHistrogram(12);
    slider.onChange(() => {
        changeRaceList();
    });
});
