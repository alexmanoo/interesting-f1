csv_data.then(() => {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    let translate = {x: width / 2 + (margin.right+margin.left)/2, y: height / 2 + (margin.top+margin.bottom)/2};
    let radius = Math.min(width, height) / 2;

    // set the colors
    let colors = ["red", "yellow", "lightgrey", "green", "blue", "purple"];

    rerun();

    slider.onChange((newRange) => {
        rerun();
    });

    function rerun() {
        // Extract data for the selected IDs
        let filteredData = tire_types.filter((d) => current_raceIds.includes(+d.raceId));

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
        var svg = d3.select("#tire-types")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + translate.x + "," + translate.y + ")");

        // Set up the pie chart layout
        var pie = d3.pie();

        // Create an arc generator
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        // Join new data
        var arcs = svg.selectAll("path")
            .data(pie(data));

        // Enter new arcs
        arcs.enter()
            .append("path")
            .attr("fill", (d, i) => colors[i])
            .attr("d", arc)
            .transition()

        // Remove old arcs
        arcs.exit()
            .remove();

    }

});