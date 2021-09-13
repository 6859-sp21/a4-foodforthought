d3.csv("https://raw.githubusercontent.com/CakeMoon/6.859/main/water_usage.csv").then((data) => {
    // 1. Sort data.
    data.forEach(d => d.Water = parseInt(d.Water, 10));
    data.sort((a, b) => a.Water - b.Water);
    data.forEach((d, i) => d.Rank = i + 1);
    var waterUsed = 0;
    var selected = [];

        // 2. Setting up variables that describe our chart's space.
        const height = 400;
        const width = 500;;
        const margin = ({top: 10, right: 10, bottom: 40, left: 120});
    // See https://developer.mozilla.org/en-US/docs/Web/SVG for more on SVGs.
    const svg = d3.create('svg')
        .attr('width', width)
        .attr('height', height);

    svg.append("clipPath")
    .attr("id", 'my-clip-path')
    .append("rect")
        .attr("x", -100)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);

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
        .attr('y', margin.top + 60)
        .attr('fill', '#000000')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-weight', 700)
        .attr('font-size', 35)
        .text(waterUsed);
    const numberContext = svg.append('text')
        .attr("text-anchor", "end")
        .attr('x', width - margin.right)
        .attr('y', margin.top + 110)
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
                    .style("left", (event.clientX - 600) + "px")
                    .style("background", 'white')
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

        updateBars(data, selected);
    }

    d3.selectAll(("input[id='search']"))
        .on("keyup", search);

    d3.selectAll(("input[name='options']"))
        .on("change", reorder);

    // 12. zoom function
    const zoom = d3.zoom()
    .scaleExtent([1, 32])
    .extent([[margin.left, 0], [width - margin.right, height]])
    .translateExtent([[margin.left, 0], [width - margin.right, height]])
    .on("zoom", zoomed);


    function zoomed(event) {
        yScale.range([height - margin.bottom, margin.top].map(d => event.transform.applyY(d)));
        svg.selectAll(".bar").attr("y", d => yScale(d.Entity)).attr("height", yScale.bandwidth());
        yAxis.call(y, yScale);
    }
    svg.call(zoom);

    updateBars(data, selected);
    document.getElementById("vis").appendChild(svg.node());
});

function show() {
    var x = document.getElementById("vis");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}