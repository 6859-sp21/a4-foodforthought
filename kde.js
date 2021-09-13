var margin = {top: 30, right: 30, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
const x_min = -5, x_max = 15;
var graph_padding = 10;


// const viz = d3.select("#viz").text('hello');
// viz.append('svg');

// const svg = d3.select('svg')
//     .;


d3.json("https://gist.githubusercontent.com/sauhaardac/11a605b1291add372ab77cff7044353f/raw/281e2d8a8ea91ce1afa7224717db07b3d94a2d1f/commodities.json").then((data) => {

        const svg = d3.select('#viz').append('svg').attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        var x = d3.scaleLinear()
            .domain([x_min, x_max])
            .range([0, width]);
        var kde = kernelDensityEstimator(kernelEpanechnikov(1), x.ticks(100))

        var colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(Object.keys(data))

        d3.select('#controls').selectAll('input')
            .data(Object.keys(data))
            .enter()
            .append('a')
            .text((d) => d)
            .append('input')
            .attr('type', 'checkbox')
            .attr('id', (d) => d.replace(/\s/g, ''))
            .on('change', update)
            .property('checked', true);

        update();


        function update() {
            d3.select("svg").html("");
            const newData = Object.keys(data)
                .filter(key => d3.select("#" + key.replace(/\s/g, '')).property("checked"))
                .reduce((obj, key) => {
                    obj[key] = data[key];
                    return obj;
                }, {});

            const used_commodities = Object.keys(newData);
            const num_commodities = Object.keys(newData).length;
            var comm_num = 0;

            for (var comm of Object.keys(newData)) {
                console.log(`Commodity (#${comm_num}) = ${comm}`);
                indicator = newData[comm];

                var density = [[x_min, 0]];
                density = density.concat(kde(indicator.map((d) => d)))
                density = density.concat([[x_max, 0]])


                var y = d3.scaleLinear()
                    .range([(comm_num + 1) * height / num_commodities, (comm_num) * height / num_commodities])
                    .domain([0, 1.5 * d3.max(density, (d) => d[1])]);


                if (comm_num === num_commodities - 1) {
                    svg.append("g")
                        .attr("transform", "translate(0," + (comm_num + 1) * height / num_commodities + ")")
                        .call(d3.axisBottom(x));
                } else {
                    svg.append("g")
                        .attr("transform", "translate(0," + (comm_num + 1) * height / num_commodities + ")")
                        .call(d3.axisBottom(x).tickSize(0).tickValues([]));
                }
                svg.append("g")
                    .attr("transform", "translate(" + x(0) + ", 0)")
                    .call(d3.axisLeft(y).tickSize(0).tickValues([]));

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

                curve.transition().duration(300).ease(d3.easeLinear).attr('opacity', 1)

                comm_num += 1;
            }

        }
    }
);
// function (d) {
//     console.log(d);
// });

// d3.json("https://gist.githubusercontent.com/sauhaardac/11a605b1291add372ab77cff7044353f/raw/281e2d8a8ea91ce1afa7224717db07b3d94a2d1f/commodities.json", function (data) {
//     // add the x Axis
//     console.log('hello world');
//     var x = d3.scaleLinear()
//         .domain([x_min, x_max])
//         .range([0, width]);
//     var kde = kernelDensityEstimator(kernelEpanechnikov(1), x.ticks(100))
//
//     var colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(Object.keys(data))
//
//     d3.select('#controls').selectAll('input')
//         .data(Object.keys(data))
//         .enter()
//         .append('a')
//         .text((d) => d)
//         .append('input')
//         .attr('type', 'checkbox')
//         .attr('id', (d) => d.replace(/\s/g, ''))
//         .on('change', update)
//         .property('checked', true);
//
//     update();
//
//     function update() {
//         console.log(data);
//
//         const newData = Object.keys(data).filter(
//             d => d3.select('#' + d.replace(/\s/g, '')).property('checked')
//         ).reduce((obj, key) => {
//             obj[key] = data[key];
//             return obj;
//         }, {});
//
//         const num_commodities = Object.keys(newData).length;
//         var comm_num = 0;
//
//         svg.selectAll('.minigraph').data(Object.keys(data)).join(
//             enter => enter.append('g').attr('class', 'minigraph').attr('id', (d) => d),
//             update => update,
//             exit => exit.remove()
//         )
//
//         Object.keys(newData);
//         //
//         //
//         // for (var comm of Object.keys(data)) {
//         //     console.log(`Commodity (#${comm_num}) = ${comm}`);
//         //     indicator = data[comm];
//         //
//         //     var density = [[-5, 0]];
//         //     density = density.concat(kde(indicator.map((d) => d)))
//         //     density = density.concat([[15, 0]])
//         //
//         //
//         //     var y = d3.scaleLinear()
//         //         .range([(comm_num + 1) * height / num_commodities, (comm_num) * height / num_commodities])
//         //         .domain([0, 1.5 * d3.max(density, (d) => d[1])]);
//         //
//         //
//         //     if (comm_num === num_commodities - 1) {
//         //         svg.append("g")
//         //             .attr("transform", "translate(0," + (comm_num + 1) * height / num_commodities + ")")
//         //             .call(d3.axisBottom(x));
//         //     } else {
//         //         svg.append("g")
//         //             .attr("transform", "translate(0," + (comm_num + 1) * height / num_commodities + ")")
//         //             .call(d3.axisBottom(x).tickSize(0).tickValues([]));
//         //     }
//         //     svg.append("g")
//         //         .attr("transform", "translate(" + x(0) + ", 0)")
//         //         .call(d3.axisLeft(y).tickSize(0).tickValues([]));
//         //
//         //
//         //     // Plot the area
//         //     var curve = svg
//         //         .append('g')
//         //         .append("path")
//         //         .attr("class", "mypath")
//         //         .data(density)
//         //         .attr("fill", colorScale(comm))
//         //         .attr("opacity", "0.8")
//         //         .attr("stroke", "#000")
//         //         .attr("stroke-width", 1)
//         //         .attr("stroke-linejoin", "round");
//         //
//         //
//         //     curve
//         //         .data(density)
//         //         .transition()
//         //         .duration(500)
//         //         .attr("d", d3.line()
//         //             .curve(d3.curveBasis)
//         //             .x(function (d) {
//         //                 return x(d[0]);
//         //             })
//         //             .y(function (d) {
//         //                 return y(d[1]);
//         //             })
//         //         );
//         //
//         //     comm_num += 1;
//         // }
//     }
// });


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
