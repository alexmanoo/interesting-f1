// csv_data.then(() => {
let changeListeners = [];
function createYearPicker() {
    let data = loadYearPickerData();

    var margin = { top: 30, right: 25, bottom: 30, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

        d3.select("#year-picker").select("svg").remove();
        d3.select("#year-picker").select("svg").remove();

    var svg = d3
        .select("#year-picker")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const myGroups = Array.from(new Set(data.map((d) => d[0])));
    const myVars = [""];

    const x = d3.scaleBand().range([0, width]).domain(myGroups).padding(0.2);
    svg.append("g")
        .style("font-size", 10)
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain")
        .remove();

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

    // create tooltip
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
            d3.select(this).style("stroke", "#708238").style("opacity", 1);
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
            return selected_years.includes(parseInt(d[0])) ? "#708238" : "none";
        })
        .style("opacity", function (d) {
            return selected_years.includes(parseInt(d[0])) ? 1 : 0.8;
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", mouseclick);

    runCallbacks();
    createYearPickerLegend(myColor, height);

    function onChange(callback) {
        changeListeners.push(callback);
        return this;
    }

    function runCallbacks() {
        changeListeners.forEach((callback) => callback());
    }

    function reCreate() {
        let old_callbacks = callbacks;
        yearPicker = initYearPicker(old_callbacks);
        return yearPicker;
    }

    return {
        onChange: onChange,
        getCallbacks: () => changeListeners,
        runCallbacks: runCallbacks,
        reCreate: reCreate,
    };
}

function loadYearPickerData() {
    // Get all years and counts from current_raceIds
    let years = current_raceIds_allYears.map((raceId) => {
        return [raceId, races_dict[raceId].year];
    });

    // Group by second element (year)
    years = d3.group(years, (d) => d[1]);

    // Add missing years
    all_years.forEach((year) => {
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

function createYearPickerLegend(myColor, height) {

    var margin = { top: 30, right: 25, bottom: 30, left: 40 }
    var legendWidth = 200;
    var legendHeight = 20;
    var legendPosition = { x: margin.left, y: height - legendHeight - margin.bottom };

    var svg = d3
        .select("#year-picker")
        .append("svg")
        .attr("width", 300)
        .attr("height", 50)

    svg.append("defs")
        .append("linearGradient")
        .attr("id", "legendGradient")
        .selectAll("stop")
        .data(
            myColor.ticks(10).map((t, i, n) => ({
                offset: `${(100 * i) / n.length}%`,
                color: myColor(t),
            }))
        )
        .enter()
        .append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color);

    svg.append("rect")
        .attr("x", legendPosition.x)
        .attr("y", legendPosition.y)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legendGradient)");

    var legendScale = d3
        .scaleLinear()
        .domain(myColor.domain())
        .range([0, legendWidth]);

    svg.append("g")
        .attr(
            "transform",
            `translate(${legendPosition.x}, ${legendPosition.y + legendHeight})`
        )
        .call(d3.axisBottom(legendScale).tickSize(3).ticks(10));
}
