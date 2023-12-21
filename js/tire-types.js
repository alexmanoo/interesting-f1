csv_data.then(() => {
    // set the dimensions and margins of the graph
    var margin = { top: 50, right: 30, bottom: 30, left: 60 },
        width = 500 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    let translate = {
        x: width / 2 + (margin.right + margin.left) / 2,
        y: height / 2 + (margin.top + margin.bottom) / 2,
    };
    let radius = Math.min(width, height) / 2;

    // set the colors
    let colors = ["red", "yellow", "lightgrey", "green", "blue", "purple"];

    rerun();

    slider.onTouchEnd(rerun);
    yearPicker.onChange(rerun);

    function rerun() {
        // Extract data for the selected IDs
        let filteredData = tire_types.filter((d) =>
            current_raceIds.includes(+d.raceId)
        );

        // Calculate the sum of each category
        let sumSoft = d3.sum(filteredData, (d) => +d.soft);
        let sumMedium = d3.sum(filteredData, (d) => +d.medium);
        let sumHard = d3.sum(filteredData, (d) => +d.hard);
        let sumIntermediate = d3.sum(filteredData, (d) => +d.intermediate);
        let sumWet = d3.sum(filteredData, (d) => +d.wet);
        let sumOther = d3.sum(filteredData, (d) => +d.other);

        // Calculate percentages
        let totalRaces = filteredData.length;
        var data = [
            sumSoft / totalRaces,
            sumMedium / totalRaces,
            sumHard / totalRaces,
            sumIntermediate / totalRaces,
            sumWet / totalRaces,
            sumOther / totalRaces,
        ];

        // Append the svg object to the div for the pie chart
        d3.select("#tire-types").select("svg").remove();
        var svg = d3
            .select("#tire-types")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + translate.x + "," + translate.y + ")"
            );

        // Set up the pie chart layout
        var pie = d3.pie();

        // Create an arc generator
        var arc = d3.arc().innerRadius(0).outerRadius(radius);

        // Join new data
        var arcs = svg.selectAll("path").data(pie(data));

        // Enter new arcs
        arcs.enter()
            .append("path")
            .attr("fill", (d, i) => colors[i])
            .attr("d", arc)
            .transition();

        // Remove old arcs
        arcs.exit().remove();

        // Add title to the graph
        svg.append("text")
            .attr("x", -250)
            .attr("y", -250) // Adjust this value if needed
            .attr("text-anchor", "left")
            .style("font-size", "22px")
            .text("Tire types"); // Replace with your actual title

        // Add subtitle to the graph
        svg.append("text")
            .attr("x", -250)
            .attr("y", -220) // Adjust this value if needed
            .attr("text-anchor", "left")
            .style("font-size", "14px")
            .style("fill", "grey")
            .style("max-width", 400)
            .text(
                "Shows the types of tires used in all laps from your selection. "
            ); // Replace with your actual subtitle

        // Add legend for the pie chart
        d3.select("#pie-legend").select("svg").remove();

        var svg = d3
            .select("#pie-legend")
            .append("svg")
            .attr("width", 200)
            .attr("height", height)
            .append("g");
        // .attr("transform",
        //     "translate(" + -20 + "," + 50 + ")");

        svg.selectAll("mydots")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function (d, i) {
                return 100 + i * 25;
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function (d, i) {
                return colors[i];
            });

        // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
            .data(data)
            .enter()
            .append("text")
            .attr("x", 120)
            .attr("y", function (d, i) {
                return 100 + i * 25;
            }) // 100 is where the first dot appears. 25 is the distance between dots
            // .style("fill", function(d,i){ return colors[i]})
            .text(function (d, i) {
                return tire_types.columns[i + 2];
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
    }
});
