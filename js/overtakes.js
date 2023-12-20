csv_data.then(() => {
    var tooltip = d3
        .select("#overtakes")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background-color", "#ffffff") // Set the background color
        .style("border", "1px solid #000000") // Set the border
        .style("border-radius", "10px")
        .style("padding", "10px"); // Set padding for content

    var margin = { top: 50, right: 50, bottom: 50, left: 40 },
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand().range([0, width]).padding(0.3);
    var y = d3.scaleLinear().range([height, 0]);
    tooltip.style("font-size", 15 * (width / 1100) + "px"); // Set the desired font size for the text

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
        .style("font-size", 15 * (width / 500) + "px")
        .style("font-family", "Helvetica")
        .style("font-weight", "bold") // Add bold style
        .text("Races vs. Number of Overtakes");

    var filteredData;
    function updateHistrogram(bins) {
        var range = 80;
        var incr = range / bins;

        var raceCounts = {};
        for (var i = 0; i < range - 1; i += incr) {
            raceCounts[`${Math.round(i)}-${Math.round(i + incr - 1)}`] = 0;
        }
        raceCounts[`${range}+`] = 0;

        filteredData.forEach(function (d) {
            for (var i = 0; i < range; i += incr) {
                if (d.Overtakes >= i && d.Overtakes <= i + incr) {
                    raceCounts[
                        `${Math.round(i)}-${Math.round(i + incr - 1)}`
                    ]++;
                    break;
                }
            }
            if (d.Overtakes > range) {
                raceCounts[`${range}+`]++;
            }
        });

        var barData = Object.keys(raceCounts).map(function (key) {
            return { category: key, count: raceCounts[key] };
        });

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
        // ... (previous code)

        // Select existing bars and apply transitions
        var bars = svg.selectAll(".bar").data(barData);

        bars.exit().remove(); // Remove bars that are not needed

        var maxY = d3.max(barData, function (d) {
            return d.count;
        });

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", x.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            .attr("x", function (d) {
                return x(d.category);
            })
            .attr("fill", function (d) {
                return barColor(d.category);
            })
            .merge(bars)
            .transition()
            .duration(500)
            .attr("y", function (d) {
                return y(d.count);
            })
            .attr("height", function (d) {
                return height - y(d.count);
            })
            .on("end", function () {
                // Re-add mouseover and tooltip functionality after the transition
                d3.select(this)
                    .on("mouseover", function (event, d) {
                        var [x, y] = d3.pointer(event);
                        tooltip.transition().duration(200).style("opacity", 1);
                        tooltip.html(
                            "Numbers of Overtakes: " +
                                d.category +
                                "<br>Number of races: " +
                                d.count
                        );
                        svg.append("line")
                            .attr("class", "hover-line")
                            .transition()
                            .duration(300)
                            .style("opacity", 0.9)
                            .attr("x1", 0)
                            .attr("x2", width)
                            .attr("y1", height - (d.count / maxY) * height)
                            .attr("y2", height - (d.count / maxY) * height)
                            .attr("stroke", "red")
                            .attr("stroke-width", 2);
                    })
                    .on("mouseout", function () {
                        tooltip.transition().duration(500).style("opacity", 0);
                        svg.selectAll(".hover-line").remove();
                    });
            });

        // Add x-axis labels
        svg.selectAll(".x-axis-label")
            .data(barData)
            .enter()
            .append("text")
            .attr("class", "x-axis-label")
            .attr("x", function (d) {
                return x(d.category) + x.bandwidth() / 2;
            })
            .attr("y", height * 1.035) // Adjust the y position based on your preference
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.category;
            })
            .style("font-size", 26 * (width / 1500) + "px") // Adjust the font size as needed
            .style("font-family", "Helvetica")
            .style("transform", "rotate(0)"); // Rotate the labels for better visibility

        // ... (remaining code)

        svg.selectAll("g").remove();

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(0).tickFormat(""));

        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", 28 * (width / 1500) + "px");
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
    slider.onTouchEnd(changeRaceList);
    yearPicker.onChange(changeRaceList);
});
