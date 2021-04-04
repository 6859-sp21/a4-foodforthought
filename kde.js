var margin = {top: 30, right: 30, bottom: 30, left: 50},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


var svg = d3.select("#viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


d3.json("data/commodities.json", function (data) {
    // add the x Axis
    var x = d3.scaleLinear()
        .domain([-5, 80])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 0.1]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Compute kernel density estimation
    var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(70))
    var density = kde(data.Beef.map((d) => d))

    // Plot the area
    var curve = svg
        .append('g')
        .append("path")
        .attr("class", "mypath")
        .datum(density)
        .attr("fill", "#69b3a2")
        .attr("opacity", ".8")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round");

    curve
        .datum(density)
        .transition()
        .duration(500)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function (d) {
                return x(d[0]);
            })
            .y(function (d) {
                return y(d[1]);
            })
        );
});


// Function to compute density
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
