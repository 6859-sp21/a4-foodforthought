d3.csv("https://raw.githubusercontent.com/CakeMoon/6.859/main/water_usage.csv").then((data) => {
    // 1. Sort data.
    data.forEach(d => d.Water = parseInt(d.Water, 10));
    data.sort((a, b) => b.Water - a.Water);
    console.log(data);
    data.forEach((d, i) => d.Entity = `${i + 1}. ${d.Entity}`);
    const initialData = data.slice(0, 9);
    console.log(initialData);
    var WaterUsed;

    // create the drop down menu of cities
	var selector = d3.select("#chart")
        .append("select")
        .attr("id", "EntitySelector")
        .selectAll("option")
        .data(data)
        .enter().append("option")
        .text(function(d) { return d.Entity; })
        .attr("value", function (d, i) {
            return i;
        });

    // 2. Setting up variables that describe our chart's space.
    const height = 400;
    const width = 500;;
    const margin = ({top: 10, right: 10, bottom: 20, left: 100});

    // 3. Create a SVG we will use to make our chart.
    // See https://developer.mozilla.org/en-US/docs/Web/SVG for more on SVGs.
    const svg = d3.create('svg')
        .attr('width', width)
        .attr('height', height);

    // 4. Setting up scales.
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(initialData, d => d.Water)])
        .range([margin.left, width - margin.right])
        .nice();
    
    const yScale = d3.scaleBand()
        .domain(initialData.map(d => d.Entity))
        .range([height - margin.bottom, margin.top])
        .padding(0.1);

    const coloring = function(d, selected) {
        if (d.Entity == selected) {
            return '#ff8769';
        }
        return '#65d5db';
    }

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    //6. Drawing our x-axis
    const xAxis = svg.append('g')
                    .attr('transform', `translate(0, ${height - margin.bottom})`)
                    .call(d3.axisBottom(xScale))
                    // Add x-axis title 'text' element.
                    // .append('text')
                    //     .attr('text-anchor', 'end')
                    //     .attr('fill', 'black')
                    //     .attr('font-size', '12px')
                    //     .attr('font-weight', 'bold')
                    //     .attr('x', width - margin.right)
                    //     .attr('y', -10)
                    //     .text('Water');

    //7. Drawing our y-axis
    const yAxis = svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))
        // Add y-axis title 'text' element.
        // .append('text')
        //     .attr('transform', `translate(20, ${margin.top}) rotate(-90)`)
        //     .attr('text-anchor', 'end')
        //     .attr("transform", "rotate(-90)")
        //     .attr('fill', 'black')
        //     .attr('font-size', '12px')
        //     .attr('font-weight', 'bold')
        //     .text('Entity');
        
    //8.  Adding a background label for the number.
    const numberLabel = svg.append('text')
        .attr("text-anchor", "end")
        .attr('x', width - margin.right)
        .attr('y', margin.top + 60)
        .attr('fill', '#ccc')
        .attr('font-family', 'Helvetica Neue, Arial')
        .attr('font-weight', 500)
        .attr('font-size', 80)
        .text(WaterUsed);

    const updateBars = function(data, selected) {
        // First update the y-axis domain to match data
        console.log(data);
        xScale.domain([0, d3.max(data, d => d.Water)]);
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale))

        yScale.domain(data.map(d => d.Entity));
        yAxis.transition().duration(1000).call(d3.axisLeft(yScale));
        
        //xAxisHandleForUpdate.call(xAxis);

        const bars = svg
            .selectAll(".bar")
            .data(data)

        // Add bars for new data
        bars.enter()
          .append("rect")
            .attr("class", "bar")
            .attr('x', margin.left)
            .attr('y', d => yScale(d.Entity))
            .attr('width', d => xScale(d.Water) - margin.left)
            .attr('height', yScale.bandwidth())
            .attr('fill', d => coloring(d, selected))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", .9);
                tooltip.html("Food: " + d.Entity + "<br/> Water: " + d.Water)
                .style("left", (event.pageX) + "px")
                .style("background", 'white')
                .style("top", (event.pageY - 28) + "px");

                //.attr("d", symbol.size(64 * 4));
                })
            .on("mouseout", function(event, d) {
                tooltip.transition()
                .duration(500)
                .style("opacity", 0);

                //.attr("d", symbol.size(64));
            });

        // Update old ones, already have x / width from before
        bars
            .transition().duration(250)
            .attr('x', margin.left)
            .attr('y', d => yScale(d.Entity))
            .attr('width', d => xScale(d.Water) - margin.left)
            .attr('height', yScale.bandwidth())
            .attr('fill', d => coloring(d, selected))

        // Remove old ones
        bars.exit().remove();

        numberLabel
            .text(WaterUsed)
            .transition()
            .duration(1000)
    };

    const update = function() {
        const n = data.length;
        const index = parseInt(d3.select(this).property('value'), 10);
        var start, end;
        const selctedEntity = data[index].Entity;
        WaterUsed = data[index].Water;
        if (index < 4) {
            start = 0;
            end = 9;
        } else if (index > n - 5) {
            start = n - 9;
            end = n;
        } else {
            start = index - 4;
            end = index + 5;
        }
        const newData = data.slice(start, end);
        updateBars(newData, selctedEntity);
    };

    d3.select("#EntitySelector")
        .on("change", update);

    updateBars(initialData);

    document.getElementById("chart").appendChild(svg.node());
    });

    function show() {
        var x = document.getElementById("chart");
        if (x.style.display === "none") {
          x.style.display = "block";
        } else {
          x.style.display = "none";
        }
      }