csv_data.then(() => {
    let IDs = [879];
    let colors = ["red", "yellow", "lightgrey", "green", "blue", "purple"];

    let sizes = {
        innerRadius: 50,
        outerRadius: 100,
    };

    let durations = {
        entryAnimation: 2000,
    };

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

        draw(data);
    }

    function draw(data) {
        d3.select("#chart").html("");

        let generator = d3.pie().sort(null);

        let chart = generator(data);

        let arcs = d3
            .select("#chart")
            .append("g")
            .attr("transform", "translate(100, 100)")
            .selectAll("path")
            .data(chart)
            .enter()
            .append("path")
            .style("fill", (d, i) => colors[i]);

        let angleInterpolation = d3.interpolate(
            generator.startAngle()(),
            generator.endAngle()()
        );

        let innerRadiusInterpolation = d3.interpolate(0, sizes.innerRadius);
        let outerRadiusInterpolation = d3.interpolate(0, sizes.outerRadius);

        let arc = d3.arc();

        arcs.transition()
            .duration(durations.entryAnimation)
            .attrTween("d", (d) => {
                let originalEnd = d.endAngle;
                return (t) => {
                    let currentAngle = angleInterpolation(t);
                    if (currentAngle < d.startAngle) {
                        return "";
                    }

                    d.endAngle = Math.min(currentAngle, originalEnd);

                    return arc(d);
                };
            });

        d3.select("#chart")
            .transition()
            .duration(durations.entryAnimation)
            .tween("arcRadii", () => {
                return (t) =>
                    arc
                        .innerRadius(innerRadiusInterpolation(t))
                        .outerRadius(outerRadiusInterpolation(t));
            });
    }
});
