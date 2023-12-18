csv_data.then(() => {
    // Largeur de la width
    var obj = document.getElementById("dnf");
    var divWidth = obj.offsetWidth;

    // Update the width and height variables based on your requirements
    // For example, you might want to use the size of a specific container element
    var gridItem = document.querySelector(".grid-item");

    // Get the dimensions of the grid item
    var gridItemWidth = gridItem.clientWidth;
    var gridItemHeight = gridItem.clientHeight;

    var margin = { top: 40, right: 0, bottom: 0, left: 0 },
        width = gridItemWidth,
        height = gridItemHeight,
        formatNumber = d3v3.format(",%"),
        colorDomain = [-0.1, 0, 0.1],
        colorRange = ["#dda8db", "#ebf2f7", "#9cbdd9"],
        transitioning;

    // sets x and y scale to determine size of visible boxes
    var x = d3v3.scale.linear().domain([0, width]).range([0, width]);

    var y = d3v3.scale.linear().domain([0, height]).range([0, height]);

    // adding a color scale
    var color = d3v3.scale.linear().domain(colorDomain).range(colorRange);

    // introduce color scale here
    var treemap = d3v3.layout
        .treemap()
        .children(function (d, depth) {
            return depth ? null : d._children;
        })
        .sort(function (a, b) {
            return a.value - b.value;
        })
        .ratio((height / width) * 0.5 * (1 + Math.sqrt(5)))
        .round(false);
    var svg = d3v3
        .select("#dnf")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    var grandparent = svg.append("g").attr("class", "grandparent");

    grandparent
        .append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    grandparent
        .append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

    // functions
    function initialize(root) {
        root.x = root.y = 0;
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
        return (d._children = d.children)
            ? // recursion step, note that p and v are defined by reduce
              (d.value = d.children.reduce(function (p, v) {
                  return p + accumulate(v);
              }, 0))
            : d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
        if (d._children) {
            // treemap nodes comes from the treemap set of functions as part of d3v3
            treemap.nodes({ _children: d._children });
            d._children.forEach(function (c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                // recursion
                layout(c);
            });
        }
    }

    // determines if white or black will be better contrasting color
    function getContrast50(hexcolor) {
        return parseInt(hexcolor.replace("#", ""), 16) > 0xffffff / 3
            ? "black"
            : "white";
    }
    var filteredData;
    var myColors = ["#4169b0", "#0080c4", "#0092d6", "#009ee3"];
    changeRaceList();
    function updateTreemap() {
        var root = {
            name: "total_finishes",
            rate: 0,
            children: [
                {
                    name: "Finished",
                    rate: 1,
                    value: 0,
                },
                {
                    name: "Did-Not-Finish",
                    rate: 1,
                    children: [
                        {
                            name: "Accidents and Disqualifications",
                            rate: 2,
                            children: [
                                {
                                    name: "Accident",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Collision",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Spun off",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "DQ",
                                    rate: 3,
                                    value: 0,
                                },
                            ],
                        },
                        {
                            name: "Technical Issues",
                            rate: 2,
                            children: [
                                {
                                    name: "Engine",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Gearbox",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Transmission",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Clutch",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Hydraulics",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Electrical",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Suspension",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Brakes",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Overheating",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Mechanical",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Tyre",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Puncture",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "Other",
                                    rate: 3,
                                    value: 0,
                                },
                            ],
                        },
                        {
                            name: "Laps Completed",
                            rate: 2,
                            children: [
                                {
                                    name: "1 Lap",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "2 Laps",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "3 Laps",
                                    rate: 3,
                                    value: 0,
                                },
                                {
                                    name: "4 Laps and over",
                                    rate: 3,
                                    value: 0,
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        filteredData.forEach(function (d) {
            root.children[0].value += d.Finished;
            root.children[1].children[0].children[0].value += d.Accident;
            root.children[1].children[0].children[1].value += d.Collision;
            root.children[1].children[0].children[2].value += d.Spunoff;
            root.children[1].children[0].children[3].value += d.Spunoff;
            root.children[1].children[1].children[0].value += d.Disqualified;
            root.children[1].children[1].children[1].value += d.Gearbox;
            root.children[1].children[1].children[2].value += d.Transmission;
            root.children[1].children[1].children[3].value += d.Clutch;
            root.children[1].children[1].children[4].value += d.Hydraulics;
            root.children[1].children[1].children[5].value += d.Electrical;
            root.children[1].children[1].children[6].value += d.Suspension;
            root.children[1].children[1].children[7].value += d.Brakes;
            root.children[1].children[1].children[8].value += d.Overheating;
            root.children[1].children[1].children[9].value += d.Mechanical;
            root.children[1].children[1].children[10].value += d.Tyre;
            root.children[1].children[1].children[11].value += d.Puncture;
            root.children[1].children[1].children[12].value += d.Differential; //
            root.children[1].children[1].children[12].value += d.Radiator; //
            root.children[1].children[1].children[12].value += d.DriverSeat; //
            root.children[1].children[1].children[12].value += d.Driveshaft; //
            root.children[1].children[2].children[0].value += d.Lap1;
            root.children[1].children[2].children[1].value += d.Laps2;
            root.children[1].children[2].children[2].value += d.Laps3;
            root.children[1].children[2].children[3].value += d.Laps4;
            root.children[1].children[2].children[3].value += d.Laps5;
            root.children[1].children[2].children[3].value += d.Laps6;
            root.children[1].children[2].children[3].value += d.Laps7;
            root.children[1].children[2].children[3].value += d.Laps8;
            root.children[1].children[2].children[3].value += d.Laps9;
            // Continue updating other properties similarly
            // root.children[1].children[3].children[9].value += +d.SomeOtherProperty;
        });

        console.log(root);
        initialize(root);
        accumulate(root);
        layout(root);
        display(root);
    }
    function display(d) {
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d))
            .style("font-family", "sans-serif");

        // color header based on grandparent's rate
        grandparent
            .datum(d.parent)
            .select("rect")
            .attr("fill", function () {
                return myColors[d.rate];
            });

        var g1 = svg
            .insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");

        var g = g1.selectAll("g").data(d._children).enter().append("g");

        g.filter(function (d) {
            return d._children;
        })
            .classed("children", true)
            .on("click", transition);

        g.selectAll(".child")
            .data(function (d) {
                return d._children || [d];
            })
            .enter()
            .append("rect")
            .attr("class", "child")
            .call(rect);

        g.append("rect").attr("class", "parent").call(rect).append("title");

        /* Adding a foreign object instead of a text object, allows for text wrapping */
        g.append("foreignObject")
            .call(rect)
            /* open new window based on the json's URL value for leaf nodes */
            /* Firefox displays this on top
    	.on("click", function(d) {
    		if(!d.children){
    			window.open(d.url);
    	}
    })*/
            .attr("class", "foreignobj")
            .append("xhtml:div")
            .attr("dy", ".75em")
            .html(function (d) {
                return (
                    "" +
                    ' <p class="title"> ' +
                    d.name +
                    "</p>" +
                    " <p> Count: " +
                    d3v3.round(d.value, 2)
                );
            })
            .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS

        function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;

            var g2 = display(d),
                t1 = g1.transition().duration(650),
                t2 = g2.transition().duration(650);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function (a, b) {
                return a.depth - b.depth;
            });

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);
            g2.selectAll("foreignObject div").style(
                "display",
                "none"
            ); /*added*/

            // Transition to the new view.
            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            /* Foreign object */
            t1.selectAll(".textdiv").style("display", "none"); /* added */
            t1.selectAll(".foreignobj").call(foreign); /* added */
            t2.selectAll(".textdiv").style("display", "block"); /* added */
            t2.selectAll(".foreignobj").call(foreign); /* added */

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function () {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });
        }

        return g;
    }

    function text(text) {
        text.attr("x", function (d) {
            return x(d.x) + 6;
        }).attr("y", function (d) {
            return y(d.y) + 6;
        });
    }
    function rect(rect) {
        rect.attr("x", function (d) {
            return x(d.x);
        })
            .attr("y", function (d) {
                return y(d.y);
            })
            .attr("width", function (d) {
                return x(d.x + d.dx) - x(d.x);
            })
            .attr("height", function (d) {
                return y(d.y + d.dy) - y(d.y);
            })
            .attr("fill", function (d) {
                return myColors[d.rate];
            }); // Hardcoded color value, e.g., "blue"
    }

    function foreign(foreign) {
        /* added */ foreign
            .attr("x", function (d) {
                return x(d.x);
            })
            .attr("y", function (d) {
                return y(d.y);
            })
            .attr("width", function (d) {
                return x(d.x + d.dx) - x(d.x);
            })
            .attr("height", function (d) {
                return y(d.y + d.dy) - y(d.y);
            });
    }

    function name(d) {
        return d.parent
            ? d.name + " Status  " + "  - Click Here To Zoom Out"
            : "Total Finish Status - Click And Expand A Category";
    }

    function nameSave(d) {
        return d.parent
            ? name(d.parent) + " - " + d.name + " -  Click Here To Zoom Out"
            : d.name;
    }

    function changeRaceList() {
        // Filter data based on desired IDs
        filteredData = finish_stats.filter(function (d) {
            return current_raceIds.includes(d.raceId);
        });
        updateTreemap();
    }
    changeRaceList();

    slider.onChange(() => {
        changeRaceList();
    });
});
