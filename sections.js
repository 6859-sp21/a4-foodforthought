const margin = {left: 100, top: 50, bottom: 50, right: 20}
const width = 1200 - margin.left - margin.right
const height = 850 - margin.top - margin.bottom

d3.select("#vis")
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('opacity', 1)

draw_title();

const asc = arr => arr.sort((a, b) => a - b);

const sum = arr => arr.reduce((a, b) => a + b, 0);

const mean = arr => sum(arr) / arr.length;

const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
}

var BrowserText = (function () {
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    /**
     * Measures the rendered width of arbitrary text given the font size and font face
     * @param {string} text The text to measure
     * @param {number} fontSize The font size in pixels
     * @param {string} fontFace The font face ("Arial", "Helvetica", etc.)
     * @returns {number} The width of the text
     **/
    function getWidth(text, fontSize, fontFace) {
        context.font = fontSize + 'px ' + fontFace;
        return context.measureText(text).width;
    }

    return {
        getWidth: getWidth
    };
})();

function draw_title() {
    clean();
    const svg = d3.select('#vis').select('svg')
        .attr('width', width)
        .attr('height', height)
        .append('image')
        .attr('href', 'https://www.world-grain.com/ext/resources/Article-Images/2019/11/Ceres_Water-scarcity_Photo-cred-Ceres_E.jpg?1573477827')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('x', 0)
        .attr('y', margin.top)
}

function draw_hist() {
    clean();
    const svg = d3.select('#vis').select('svg')
        .attr('width', width)
        .attr('height', height + 1000);

    d3.json("https://gist.githubusercontent.com/sauhaardac/11a605b1291add372ab77cff7044353f/raw/0cf59f720191b65a7727f46e789c266d47de919a/commodities.json").then((data) => {
            console.log(data)


            var lbl = d3.select('#buttons').selectAll('label')
                .data(Object.keys(data))
                .enter()
                .append('label')

            lbl.append('input')
                .attr('type', 'checkbox')
                .attr('class', 'graph-button')
                .attr('id', (d) => d.replace(/\s/g, ''))
                .on('change', update)
                .property('checked', (d) => (['Beef', 'Coffee', 'Maize'].some((x) => x === d.replace(/\s/g, ''))));

            lbl.append('span').text((d) => d)


            var colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(Object.keys(data))

            update();


            function update() {

                margin.top = margin.top + 100

                d3.select('#food-desc').html("")

                const newData = Object.keys(data)
                    .filter(key => d3.select("#" + key.replace(/\s/g, '')).property("checked"))
                    .reduce((obj, key) => {
                        obj[key] = data[key];
                        return obj;
                    }, {});

                var x_max = -1000;

                for (var comm of Object.keys(newData)) {
                    x_max = Math.max(x_max, quantile(newData[comm], 0.8))
                }

                var x_min = -0.1 * x_max
                // var x_min = -5, x_max = 20;

                console.log('min and max')
                console.log(x_max)
                console.log(x_min)

                var x = d3.scaleLinear()
                    .domain([x_min, x_max])
                    .range([margin.left, width + margin.left]);

                var kde = kernelDensityEstimator(kernelEpanechnikov(1), x.ticks(100))


                svg.html("");

                const used_commodities = Object.keys(newData);
                const num_commodities = Object.keys(newData).length;


                if(num_commodities === 0){
                    svg.append('text').text('Please Select Some Commodities')
                        .attr('font-family', 'Helvetica Neue, Arial')
                        .attr('font-weight', 700)
                        .attr('font-size', 25)
                        .attr("fill", 'black')
                        .attr('x', width / 2 - 250)
                        .attr('y', height / 2 - 100);

                }

                var comm_num = 0;

                var food_desc = {
                    "Beef": "Largest distribution and highest median land use; represents 22% of meat production, but 37% of all agricultural GHG emissions, suggesting serious gains in both land use and GHG emissions by reducing production and consumption.",
                    "Coffee": "Extremely sensitive to climate. Wet process methods may reduce land use and emissions but compromise on water use.",
                    "Maize": "Yields are expected to decline 10% by 2050 due to climate change. To reduce land use, using better seed and polyculture are promising techniques.",
                    "Palm Oil": "Generally poorly reported data. Contributes significantly to deforestation and slavery, despite seemingly low water and land use.",
                    "Poultry Meat": "Second most widely meat in the world. Lower land use than beef, but should reduce waste and emissions to mitigate environmental harm.",
                    "Roundwood": "Critical to paper production. Shows a negative trade-off between emissions and land use but co-benefits of reducing emissions and water use.",
                    "Salmon": "Fastest growing food production system worldwide. Reducing the use of animal by-products in feed may mitigate environmental harm from land use.",
                    "Shrimp": "Second most popular seafood in the U.S. The best way to improve shrimp farming is to reduce intensity of production.",
                    "Soybeans": "Soy is most used in animal feed, not as a human protein. GHG emissions in Latin America are directly correlated with land use, and addressing one factor is a co-benefit for the other.",
                }

                for (var comm of Object.keys(newData)) {
                    d3.select('#food-desc').append('h4')
                        .text(comm)
                    d3.select('#food-desc').append('p')
                        .text(food_desc[comm])
                    console.log(`Commodity (#${comm_num}) = ${comm}`);
                    indicator = newData[comm];

                    var density = [[x_min, 0]];
                    density = density.concat(kde(indicator.map((d) => d)))
                    density = density.concat([[x_max, 0]])

                    const graph_ymax = 1.5 * d3.max(density, (d) => d[1]);
                    var y = d3.scaleLinear()
                        .range([margin.top + (comm_num + 1) * height / (num_commodities + 1), margin.top + (comm_num) * height / (num_commodities + 1)])
                        .domain([0, graph_ymax]);

                    if (comm_num === num_commodities - 1) {
                        svg.append("g")
                            .attr("transform", "translate(0," + y(0) + ")")
                            .call(d3.axisBottom(x));

                        svg.append('text')
                            .attr('x', width / 2 + margin.left - BrowserText.getWidth('Land Use (m²/kg of product)', 20, 'Helvetica Neue, Arial'))
                            .attr('y', y(0) + 0.3 * margin.top)
                            .attr('font-family', 'Helvetica Neue, Arial')
                            .attr('font-weight', 700)
                            .attr('font-size', 20)
                            .attr("fill", 'black')
                            .text('Land Use (m²/kg of product)');

                    }

                    svg.append("g")
                        .attr("transform", "translate(" + x(0) + ", 0)")
                        .call(d3.axisLeft(y).tickSize(0).tickValues([]));

                    svg.append('text')
                        .attr('x', 0)
                        .attr('y', y(graph_ymax * 0.07))
                        .attr('font-family', 'Helvetica Neue, Arial')
                        .attr('font-weight', 700)
                        .attr('font-size', 30)
                        .attr("fill", colorScale(comm))
                        .text(comm);



                    // Plot the area
                    var curve = svg
                        .append('g')
                        .append("path")
                        .attr("class", "mypath")
                        .datum(density)
                        .attr("fill", colorScale(comm))
                        .attr("opacity", "0.8")
                        .attr("stroke", "#000")
                        .attr("stroke-width", 1)
                        .attr("stroke-linejoin", "round")
                        .attr("d", d3.line()
                            .curve(d3.curveBasis)
                            .x(function (d) {
                                return x(d[0]);
                            })
                            .y(function (d) {
                                return y(d[1]);
                            })
                        ).attr('opacity', 0);

                    var medians = svg.append('circle')
                        .attr('cx', x(d3.median(indicator)))
                        .attr('cy', y(graph_ymax * 0.1))
                        .attr('r', 5)
                        .attr('fill', 'white')
                        .attr('stroke', 'black')
                        .attr('stroke-width', 2)
                        .attr('opacity', 0)

                    curve.transition().duration(300).ease(d3.easeLinear).attr('opacity', 1)
                    medians.transition().duration(300).ease(d3.easeLinear).attr('opacity', 1)

                    comm_num += 1;
                }
                margin.top = margin.top - 100
            }
        }
    );
}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean() {
    let svg = d3.select('#vis').select('svg')
    svg.html("");
    // d3.selectAll('.graph-button').remove()
    d3.selectAll('#EntitySelector').remove()
    d3.selectAll('.tooltip').remove()
}

//First draw function

function draw_tree() {
    clean();
    d3v3.json("https://raw.githubusercontent.com/6859-sp21/a4-foodforthought/treemap/treemap/treemap.json", function (err, res) {
        if (!err) {
            var data = d3v3.nest().key(function (d) {
                return d.category;
            })
                .key(function (d) {
                    return d.subcategory;
                })
                .entries(res);

            main({title: "Food Contributes Close to a Third of Global GHG Emissions"}, {
                key: "Global GHG Emissions",
                values: data
            });
        }
    });
}

function draw_bar() {
    clean();
    $('#search').val('');
    $('input[name="options"]').prop("checked",true);

    d3.csv("https://raw.githubusercontent.com/CakeMoon/6.859/main/water_usage.csv").then((data) => {
        // 1. Sort data.
        data.forEach(d => d.Water = parseInt(d.Water, 10));
        data.sort((a, b) => a.Water - b.Water);
        data.forEach((d, i) => d.Rank = i + 1);
        var waterUsed = 0;
        var selected = [];

        // 2. Create a SVG we will use to make our chart.
        // See https://developer.mozilla.org/en-US/docs/Web/SVG for more on SVGs.
        const svg = d3.select('#vis').select('svg')
            .attr('width', width)
            .attr('height', height);

        // Clippath for zooming
        svg.append("clipPath")
            .attr("id", 'my-clip-path')
            .append("rect")
                .attr("x", -100)
                .attr("y", margin.top)
                .attr("width", width + 100 + margin.left + margin.right)
                .attr("height", height - margin.top - margin.bottom);
        
        svg.append('rect')
            .attr('class', 'zoom-panel')
            .attr("x", -100)
            .attr("y", margin.top)
            .attr('width', width)
            .attr('height', height)

        // 3. Setting up scales.
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Water)])
            .range([margin.left, width - margin.right])
            .nice();

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.Entity))
            .range([height - margin.bottom, margin.top])
            .padding(0.1);

        // 4. Setting up colors.
        const coloring = function (d, selected) {
            if (selected.includes(d.Entity)) {
                return '#FF930E';
            }
            return '#1F77B4';
        }

        // 5. Setting up tooltip.
        var tooltip = d3.select("#vis").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("opacity", 0);

        svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //6. Drawing our x-axis
        const x = function(g) {
            g.attr('transform', `translate(15, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .call(g => g.select(".domain").remove())
        }
    
        const xAxis = svg.append('g')
                        .attr("class", "x-axis")
                        .call(x)

        svg.append('text')
            .attr('x', (width + margin.left) / 2)
            .attr('y', height - 5)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Helvetica Neue, Arial')
            .attr('font-weight', 700)
            .attr('font-size', 20)
            .attr("fill", 'black')
            .text('Water Use (L/1000 kcal)');

        //7. Drawing our y-axis
        const y = function(g, yScale) {
            g.attr('transform', `translate(${margin.left + 15}, 0)`)
            .call(d3.axisLeft(yScale).ticks(width / 80).tickSizeOuter(0))
        }
    
        const yAxis = svg.append('g')
            .attr("class", "y-axis")
            .attr('clip-path','url(#my-clip-path)')
            .call(y, yScale)

        svg.append('text')
            .attr('transform', "rotate(-90)")
            .attr('x', -((height - margin.bottom) / 2) - 50)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Helvetica Neue, Arial')
            .attr('font-weight', 700)
            .attr('font-size', 20)
            .attr("fill", 'black')
            .text('Food Commodity');

        //8.  Adding a background label for the number.
        const numberLabel = svg.append('text')
            .attr("text-anchor", "end")
            .attr('x', width - margin.right)
            .attr('y', height - margin.bottom - 70)
            .attr('fill', '#000000')
            .attr('font-family', 'Helvetica Neue, Arial')
            .attr('font-weight', 700)
            .attr('font-size', 35)
            .text(waterUsed);
        const numberContext = svg.append('text')
            .attr("text-anchor", "end")
            .attr('x', width - margin.right)
            .attr('y', height - margin.bottom - 20)
            .attr('fill', '#000000')
            .attr('font-family', 'Helvetica Neue, Arial')
            .attr('font-weight', 700)
            .attr('font-size', 35)
            .text(waterUsed);

        // 9. update bars
        const updateBars = function (data, selected) {
            // First update the y-axis domain to match data
            xScale.domain([0, d3.max(data, d => d.Water)]);
            xAxis.transition().duration(1000).call(d3.axisBottom(xScale))

            yScale.domain(data.map(d => d.Entity));
            yAxis.transition().duration(1000).call(d3.axisLeft(yScale));

            const bars = svg
                .selectAll(".bar")
                .data(data)

            // Add bars for new data
            bars.enter()
                .append("rect")
                .attr('clip-path','url(#my-clip-path)')
                .attr("class", "bar")
                .attr('x', margin.left + 15)
                .attr('y', d => yScale(d.Entity))
                .attr('width', d => xScale(d.Water) - margin.left)
                .attr('height', yScale.bandwidth())
                .attr('fill', d => coloring(d, selected))
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html("Rank: " + d.Rank + "<br/> Food: " + d.Entity + "<br/> Water: " + d.Water)
                        .style("left", (event.clientX - 650) + "px")
                        .style("top", (event.clientY) + "px");
                })
                .on("mouseout", function (event, d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            // Update old ones, already have x / width from before
            bars
                .transition().duration(250)
                .attr('x', margin.left + 15)
                .attr('y', d => yScale(d.Entity))
                .attr('width', d => xScale(d.Water) - margin.left)
                .attr('height', yScale.bandwidth())
                .attr('fill', d => coloring(d, selected))

            // Remove old ones
            bars.exit().remove();

            numberLabel
                .text(waterUsed + ' L/1000 kcal =')
                .transition()
                .duration(1000)
            numberContext
                .text(Number((waterUsed / 300).toFixed(2)) + ' bathtubs/meal')
                .transition()
                .duration(1000)
        };

        // 10. reoder bars
        const reorder = function () {
            const type = d3.select(this).property('value');
            if (type == 'name') {
                data.sort((a, b) => {
                    if(a.Entity < b.Entity) { return 1; }
                    if(a.Entity > b.Entity) { return -1; }
                    return 0;
                })
            }
            else if (type == 'water') {
                data.sort((a, b) => a.Water - b.Water);
            }

            svg.transition()
            .delay("1000")
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
            updateBars(data, selected);
        };

        // 11. highlight the searched bars
        const search = function() {
            const filter = d3.select(this).property('value').toUpperCase();
            selected = []
            data.forEach(d => {
                if (d.Entity.toUpperCase().indexOf(filter) > -1) {
                    selected.push(d.Entity)
                }
            });
            if (filter.length == 0) {
                selected = [];
            }

            waterUsed = 0
            data.forEach(d => {
                if (selected.includes(d.Entity)) {
                    waterUsed += d.Water;
                }
            });

            svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
            updateBars(data, selected);
        }

        d3.selectAll(("input[id='search']"))
            .on("keyup", search);

        d3.selectAll(("input[name='options']"))
            .on("change", reorder);

        // 12. zoom function
        const zoom = d3.zoom()
            .scaleExtent([1, 32])
            .extent([[margin.left, 0], [width - margin.right, height - margin.bottom]])
            .translateExtent([[margin.left, 0], [width - margin.right, height - margin.bottom]])
            .on("zoom", zoomed);
    
        function zoomed(event) {
            yScale.range([height - margin.bottom, margin.top].map(d => event.transform.applyY(d)));
            svg.selectAll(".bar").attr("y", d => yScale(d.Entity)).attr("height", yScale.bandwidth());
            yAxis.call(y, yScale);
        }

        d3.selectAll(("button[id='reset']"))
            .on("click", function() {
                svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
            });

        svg.call(zoom);

        updateBars(data, selected);
        document.getElementById("vis").appendChild(svg.node());
    });

    // function show() {
    //     var x = document.getElementById("chart");
    //     if (x.style.display === "none") {
    //         x.style.display = "block";
    //     } else {
    //         x.style.display = "none";
    //     }
    // }
}


//Array of all the graph functions
//Will be called from the scroller functionality


let activationFunctions = [
    draw_title,
    draw_tree,
    draw_bar,
    draw_hist,
]

//All the scrolling function
//Will draw a new graph based on the index provided by the scroll


let scroll = scroller()
    .container(d3.select('#graphic'))

scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function (index) {
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {
            return i === index ? 1 : 0.1;
        });

    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function (index, progress) {
    if (index == 2 & progress > 0.7) {

    }
})

function kernelDensityEstimator(kernel, X) {
    return function (V) {
        return X.map(function (x) {
            return [x, d3.mean(V, function (v) {
                return kernel(x - v);
            })];
        });
    };
}

function kernelEpanechnikov(k) {
    return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}


// Anushree Stuff
window.addEventListener('message', function (e) {
    var opts = e.data.opts,
        data = e.data.data;

    return main(opts, data);
});

var defaults = {
    margin: margin,
    rootname: "TOP",
    format: ",d",
    title: "",
    width: width,
    height: height
};

function main(o, data) {
    var root,
        opts = $.extend(true, {}, defaults, o),
        formatNumber = d3v3.format(".2f"),
        rname = opts.rootname,
        // margin = opts.margin,
        theight = 36 + 16;

    $('#chart').width(opts.width).height(opts.height);
    var width = opts.width - margin.left - margin.right,
        height = opts.height - margin.top - margin.bottom - theight,
        transitioning;

    var color = d3v3.scale.category20c();

    var x = d3v3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    var y = d3v3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    var treemap = d3v3.layout.treemap()
        .children(function (d, depth) {
            return depth ? null : d._children;
        })
        .sort(function (a, b) {
            return a.value - b.value;
        })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    var svg = d3v3.select("#vis").select("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.bottom + margin.top)
        // .style("margin-left", -margin.left + "px")
        // .style("margin.right", -margin.right + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + 50) + ")")
        .style("shape-rendering", "crispEdges");

    var grandparent = svg.append("g")
        .attr("class", "grandparent");

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em")
        .attr("font-family", "Arial");

    if (opts.title) {
        $("#chart").prepend("<p class='title'>" + opts.title + "</p>");
    }
    if (data instanceof Array) {
        root = {key: rname, values: data};
    } else {
        root = data;
    }

    initialize(root);
    accumulate(root);
    layout(root);
    console.log(root);
    display(root);

    if (window.parent !== window) {
        var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({height: myheight}, '*');
    }

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
        return (d._children = d.values)
            ? d.value = d.values.reduce(function (p, v) {
                return p + accumulate(v);
            }, 0)
            : d.value;
    }

    function layout(d) {
        if (d._children) {
            treemap.nodes({_children: d._children});
            d._children.forEach(function (c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                layout(c);
            });
        }
    }

    function display(d) {
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d) + " ⬅ (click to zoom out)")
            .attr("font-family", "Arial")
            .attr("font-weight", "bold")
            .attr("font-size", 18);

        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");

        var g = g1.selectAll("g")
            .data(d._children)
            .enter().append("g");

        g.filter(function (d) {
            return d._children;
        })
            .classed("children", true)
            .on("click", transition);

        var children = g.selectAll(".child")
            .data(function (d) {
                return d._children || [d];
            })
            .enter().append("g");

        children.append("rect")
            .attr("class", "child")
            .call(rect)
            .append("title")
            .text(function (d) {
                return d.key + " (" + formatNumber(d.value) + "\%)";
            })
            .attr("font-family", "Arial");
        children.append("text")
            .attr("class", "ctext")
            .text(function (d) {
                return d.key + " (" + formatNumber(d.value) + "\%)";
            })
            .attr("font-family", "Arial")
            .call(text2);

        g.append("rect")
            .attr("class", "parent")
            .call(rect);

        var t = g.append("text")
            .attr("class", "ptext")
            .attr("dy", ".75em")
            .attr("font-family", "Arial")

        t.append("tspan")
            .text(function (d) {
                return d.key;
            })
            .attr("font-family", "Arial");
        t.append("tspan")
            .attr("dy", "1.0em")
            .text(function (d) {
                return formatNumber(d.value) + "\%";
            })
            .attr("font-family", "Arial");
        t.call(text);

        g.selectAll("rect")
            .style("fill", function (d) {
                return color(d.key);
            });

        function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;

            var g2 = display(d);
            t1 = g1.transition().duration(500),
                t2 = g2.transition().duration(500);

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

            // Transition to the new view.
            t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
            t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
            t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
            t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function () {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });
        }

        return g;
    }

    function text(text) {
        text.selectAll("tspan")
            .attr("x", function (d) {
                return x(d.x) + 6;
            })
        text.attr("x", function (d) {
            return x(d.x) + 6;
        })
            .attr("y", function (d) {
                return y(d.y) + 6;
            })
            .style("opacity", function (d) {
                return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
            });
    }

    function text2(text) {
        text.attr("x", function (d) {
            return x(d.x + d.dx) - this.getComputedTextLength() - 6;
        })
            .attr("y", function (d) {
                return y(d.y + d.dy) - 6;
            })
            .style("opacity", function (d) {
                return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
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
            });
    }

    function name(d) {
        return d.parent
            ? name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + "\%)"
            : d.key + " (" + formatNumber(d.value) + "\%)";
    }
}