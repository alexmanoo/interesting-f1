csv_data.then(() => {
    // set the dimensions and margins of the graph
    var margin = { top: 100, right: 30, bottom: 30, left: 60 },
        width = 490 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    rerun();

    slider.onTouchEnd(rerun);
    yearPicker.onChange(rerun);

    function rerun() {
        // Prepare the data for the bar chart
        let data = races_when.filter((d) =>
            current_raceIds.includes(+d.raceId)
        );

        // create a dictionary with round as key and amount of times raced as value
        var dict = {};
        for (var i = 0; i < data.length; i++) {
            if (data[i].round in dict) {
                dict[data[i].round] += 1;
            } else {
                dict[data[i].round] = 1;
            }
        }

        // append the svg object to the body of the page
        d3.select("#races-when").select("svg").remove();
        var svg = d3
            .select("#races-when")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("display", "block")
            .style("margin", "0 auto")
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );

        // X axis: scale and draw:
        var x = d3.scaleLinear().domain([1, 22]).range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Y axis: scale and draw:
        var y = d3
            .scaleLinear()
            .domain([0, d3.max(Object.values(dict))])
            .range([height, 0]);
        svg.append("g").call(d3.axisLeft(y));

        // draw line chart using remapped data
        var line = d3
            .line()
            .x(function (d) {
                return x(d.round);
            })
            .y(function (d) {
                return y(d.count);
            });

        var lineData = Object.entries(dict).map(([round, count]) => ({
            round: +round,
            count,
        }));

        svg.append("path")
            .datum(lineData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line(lineData));

        // highlight the dot or dots with the highest count
        var max = d3.max(Object.values(dict));
        var colors = [];
        for (var i = 0; i < lineData.length; i++) {
            if (lineData[i].count == max) {
                colors.push("#ff0000");
            } else {
                colors.push("#69b3a2");
            }
        }

        // add dots with a transition in y coordinate
        svg.append("g")
            .selectAll("dot")
            .data(lineData)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.round);
            })
            .attr("cy", function (d) {
                return y(0);
            })
            .attr("r", 5)
            .attr("fill", function (d, i) {
                return colors[i];
            })
            .transition()
            .duration(400)
            .attr("cy", function (d) {
                return y(d.count);
            })
            .delay(function (d, i) {
                return i * 30;
            });

        // add x-axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width / 1.8)
            .attr("y", height + margin.top + 20)
            .text("Round");

        // add y-axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", -height / 3.2)
            .attr("y", -margin.left + 30)
            .attr("transform", "rotate(-90)")
            .text("Amount of times raced");

        // Add title to the graph
        svg.append("text")
            .attr("x", -margin.left + 20)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "left")
            .style("font-size", "22px")
            .text("When races are in the season (round)");

        // Add subtitle to the graph
        svg.append("text")
            .attr("x", -margin.left + 20)
            .attr("y", -margin.top / 2 + 20)
            .attr("text-anchor", "left")
            .style("font-size", "14px")
            .style("fill", "grey")
            .style("max-width", 400)
            .text(
                "Shows the amount of times raced (y axis) vs round (x axis). "
            );
    }
});
