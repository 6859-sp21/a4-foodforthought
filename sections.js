let dataset, svg
let salarySizeScale, salaryXScale, categoryColorScale
let simulation, nodes
let categoryLegend, salaryLegend

const categories = ['Engineering', 'Business', 'Physical Sciences', 'Law & Public Policy', 'Computers & Mathematics', 'Agriculture & Natural Resources',
    'Industrial Arts & Consumer Services', 'Arts', 'Health', 'Social Science', 'Biology & Life Science', 'Education', 'Humanities & Liberal Arts',
    'Psychology & Social Work', 'Communications & Journalism', 'Interdisciplinary']

const categoriesXY = {
    'Engineering': [0, 400, 57382, 23.9],
    'Business': [0, 600, 43538, 48.3],
    'Physical Sciences': [0, 800, 41890, 50.9],
    'Law & Public Policy': [0, 200, 42200, 48.3],
    'Computers & Mathematics': [200, 400, 42745, 31.2],
    'Agriculture & Natural Resources': [200, 600, 36900, 40.5],
    'Industrial Arts & Consumer Services': [200, 800, 36342, 35.0],
    'Arts': [200, 200, 33062, 60.4],
    'Health': [400, 400, 36825, 79.5],
    'Social Science': [400, 600, 37344, 55.4],
    'Biology & Life Science': [400, 800, 36421, 58.7],
    'Education': [400, 200, 32350, 74.9],
    'Humanities & Liberal Arts': [600, 400, 31913, 63.2],
    'Psychology & Social Work': [600, 600, 30100, 79.4],
    'Communications & Journalism': [600, 800, 34500, 65.9],
    'Interdisciplinary': [600, 200, 35000, 77.1]
}

const margin = {left: 170, top: 50, bottom: 50, right: 20}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

function drawInitial() {
    let svg = d3.select("#vis")
        .append('svg')
        .attr('width', 1000)
        .attr('height', 950)
        .attr('opacity', 1)

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
}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean(chartType) {
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "isScatter") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.best-fit').transition().duration(200).attr('opacity', 0)
    }
    if (chartType !== "isMultiples") {
        svg.selectAll('.lab-text').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.cat-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "isFirst") {
        svg.select('.first-axis').transition().attr('opacity', 0)
        svg.selectAll('.small-text').transition().attr('opacity', 0)
            .attr('x', -200)
    }
    if (chartType !== "isHist") {
        svg.selectAll('.hist-axis').transition().attr('opacity', 0)
    }
    if (chartType !== "isBubble") {
        svg.select('.enrolment-axis').transition().attr('opacity', 0)
    }
}

//First draw function

function draw1() {

}


//Array of all the graph functions
//Will be called from the scroller functionality

let activationFunctions = [
    draw1,
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