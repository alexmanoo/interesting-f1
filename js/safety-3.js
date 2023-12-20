csv_data.then(() => {
    let safetyData = loadSafetyData(min_rating, max_rating);

    function updateSafetyChart() {
        safetyData = loadSafetyData(min_rating, max_rating);

        d3.select("#safety_stackedbarchart").select("svg").remove();

        const margin = { top: 80, right: 25, bottom: 30, left: 40 },
            width = 450 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3
            .select("#safety_stackedbarchart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
        const myGroups = Array.from(new Set(safetyData.map((d) => d.safety_car)));
        const myVars = Array.from(new Set(safetyData.map((d) => d.red_flag)));

        // Build X scales and axis:
        const x = d3
            .scaleBand()
            .range([0, width])
            .domain(myGroups)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSize(0))
            .select(".domain")
            .remove();

        // Build Y scales and axis:
        const y = d3
            .scaleBand()
            .range([height, 0])
            .domain(myVars)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain")
            .remove();

        // Build color scale
        const myColor = d3
            .scaleSequential()
            .interpolator(d3.interpolateInferno)
            .domain([1, 100]);

        // create a tooltip
        const tooltip = d3
            .select("#safety_stackedbarchart")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function (event, d) {
            tooltip.style("opacity", 1);
            d3.select(this).style("stroke", "black").style("opacity", 1);
        };
        const mousemove = function (event, d) {
            tooltip
                .html("The exact value of<br>this cell is: " + (d.race_name))
                .style("left", event.x / 2 + "px")
                .style("top", event.y / 2 + "px");
        };
        const mouseleave = function (event, d) {
            tooltip.style("opacity", 0);
            d3.select(this).style("stroke", "none").style("opacity", 0.8);
        };

        // add the squares
        svg.selectAll()
            .data(safetyData, function (d) {
                return d.safety_car + ":" + d.red_flag;
            })
            .join("rect")
            .attr("x", function (d) {
                return x(d.safety_car);
            })
            .attr("y", function (d) {
                return y(d.red_flag);
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) {
                return myColor(d.safety_car + d.red_flag);
            })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    }

    updateSafetyChart();

    slider.onTouchEnd(updateSafetyChart);
    yearPicker.onChange(updateSafetyChart);
});

function loadSafetyData(min_rating = 0, max_rating = 10) {
    const filterAndSortData = (data) =>
        data
            .filter(
                (d) =>
                    !isNaN(parseFloat(d.rating)) &&
                    parseFloat(d.rating) >= min_rating &&
                    parseFloat(d.rating) <= max_rating
            )
            .sort((a, b) => a.rating - b.rating);

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

    const combinedData = combineSafetyCarsAndRedFlags(
        safetyCarsPerRace,
        redFlagsPerRace
    );

    // Group by safety car and red flag count

    const groupedData = Object.groupBy(combinedData, [
        "safety_car",
        "red_flag",
    ]);

    console.log(groupedData);

    return combineSafetyCarsAndRedFlags(safetyCarsPerRace, redFlagsPerRace);
}
