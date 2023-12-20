csv_data.then(() => {
    let data = loadYearPickerData();

    var margin = { top: 80, right: 25, bottom: 30, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

    var svg = d3
        .select("#year-picker")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array.from(new Set(data.map((d) => d[0])));
    const myVars = [""];

    // Build X scales and axis:
    const x = d3.scaleBand().range([0, width]).domain(myGroups).padding(0.05);
    svg.append("g")
        .style("font-size", 10)
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain")
        .remove();

    // Build Y scales and axis:
    const y = d3.scaleBand().range([height, 0]).domain(myVars).padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain")
        .remove();

    // Build color scale
    var myColor = d3
        .scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0, 22]);

    // create a tooltip
    const tooltip = d3
        .select("#year-picker")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
        tooltip.style("opacity", 1);
        d3.select(this).style("stroke", "black").style("opacity", 1);
    };
    const mousemove = function (event, d) {
        tooltip
            .html("The exact value of<br>this cell is: " + d[1])
            .style("left", (event.x + 15) + "px")
            .style("top", (event.y + 15) + "px");
    };
    const mouseleave = function (event, d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("stroke", "none").style("opacity", 0.8);
    };

    // add the squares
    svg.selectAll()
        .data(data, function (d) {
            return d[0] + ":" + d[1];
        })
        .join("rect")
        .attr("x", function (d) {
            return x(d[0]);
        })
        .attr("y", function (d) {
            return y("");
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) {
            return myColor(d[1]);
        })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
});

function loadYearPickerData() {
    // Get all years and counts from current_raceIds
    let years = current_raceIds.map((raceId) => {
        return [raceId, races_dict[raceId].year];
    });

    // Group by second element (year)
    years = d3.group(years, (d) => d[1]);

    // Count the number of races for each year
    years = Array.from(years, ([key, value]) => [key, value.length]);

    console.log(years);

    return years;
}
