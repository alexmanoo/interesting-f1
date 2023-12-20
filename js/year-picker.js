// csv_data.then(() => {
function createYearPicker(callbacks = []) {
    let changeListeners = callbacks;
    let data = loadYearPickerData();

    var margin = { top: 30, right: 25, bottom: 30, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    d3.select("#year-picker").select("svg").remove();

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
    };
    const mousemove = function (event, d) {
        tooltip
            .html("Number of races: " + d[1])
            .style("left", event.x + 15 + "px")
            .style("top", event.y + 15 + "px");
    };
    const mouseleave = function (event, d) {
        tooltip.style("opacity", 0);
    };

    const mouseclick = function (event, d) {
        // Toggle the year in selected_years
        if (selected_years.includes(parseInt(d[0]))) {
            d3.select(this).style("stroke", "none").style("opacity", 0.8);
            selected_years = selected_years.filter(
                (year) => year != parseInt(d[0])
            );
        } else {
            d3.select(this).style("stroke", "black").style("opacity", 1);
            selected_years.push(parseInt(d[0]));
            selected_years.sort((a, b) => a - b);
        }
        runCallbacks();
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
        .style("stroke", function (d) {
            return selected_years.includes(parseInt(d[0])) ? "black" : "none";
        })
        .style("opacity", function (d) {
            return selected_years.includes(parseInt(d[0])) ? 1 : 0.8;
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", mouseclick);


    function onChange(callback) {
        changeListeners.push(callback);
        return this;
    }

    function runCallbacks() {
        changeListeners.forEach((callback) => callback());
    }

    return { onChange: onChange, getCallbacks: () => changeListeners };
}

function reCreateYearPicker() {
    let callbacks = yearPicker.getCallbacks()
    let yearPicker = initYearPicker(callbacks)
    yearPicker.runCallbacks()
    return yearPicker
}

function loadYearPickerData() {
    // Get all years and counts from current_raceIds
    let years = current_raceIds.map((raceId) => {
        return [raceId, races_dict[raceId].year];
    });

    // Group by second element (year)
    years = d3.group(years, (d) => d[1]);

    // Add missing years from selected_years
    selected_years.forEach((year) => {
        year = year.toString();
        if (!years.has(year)) {
            years.set(year, []);
        }
    });

    // Count the number of races for each year
    years = Array.from(years, ([key, value]) => [key, value.length]);

    // Sort by year
    years.sort((a, b) => a[0] - b[0]);

    return years;
}
