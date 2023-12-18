csv_data.then(() => {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 490 - margin.left - margin.right,
    height = 440 - margin.top - margin.bottom;

    rerun();

    slider.onChange((newRange) => {
        rerun();
    });

    function rerun() {
        // Prepare the data for the bar chart
        let data = results_with_champ_pos.filter((d) => current_raceIds.includes(+d.raceId));

        var chartData = [
        {
            driver: "Number 1",
            count: d3.sum(data, function(d) {
            return d.position === "1" && d.champ_pos === "1" ? 1 : 0;
            })
        },
        {
            driver: "Number 2",
            count: d3.sum(data, function(d) {
            return d.position === "1" && d.champ_pos === "2" ? 1 : 0;
            })
        },
        {
            driver: "Number 3",
            count: d3.sum(data, function(d) {
            return d.position === "1" && d.champ_pos === "3" ? 1 : 0;
            })
        },
        {
            driver: "Rest",
            count: d3.sum(data, function(d) {
            return d.position === "1" && (d.champ_pos !== "1" && d.champ_pos !== "2" && d.champ_pos !== "3") ? 1 : 0;
            })
        }
        ];

        // Append the svg object to the div for the pie chart
        d3.select("#winner-champ-pos").select("svg").remove();
        var svg = d3.select("#winner-champ-pos")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("display", "block")
            .style("margin", "0 auto")
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Set up the scales
        var xScale = d3.scaleBand()
            .domain(chartData.map(function(d) { return d.driver; }))
            .range([0, width])
            .padding(0.1);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, function(d) { return d.count; })])
            .range([height, 0]);

        // Draw the bars
        svg.selectAll(".bar")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return xScale(d.driver); })
            // .attr("y", function(d) { return yScale(d.count); })
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .transition()
            .duration(800)
            .attr("y", function(d) { return yScale(d.count); })
            .attr("height", function(d) { return height - yScale(d.count); })
            .delay(function(d,i){return(i*100)});
        
        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.axisBottom(xScale));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(yScale));   
    }
});