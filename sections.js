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

//Read Data, convert numerical categories into floats
//Create the initial visualisation


d3.csv('data/recent-grads.csv', function (d) {
    return {
        Major: d.Major,
        Total: +d.Total,
        Men: +d.Men,
        Women: +d.Women,
        Median: +d.Median,
        Unemployment: +d.Unemployment_rate,
        Category: d.Major_category,
        ShareWomen: +d.ShareWomen,
        HistCol: +d.Histogram_column,
        Midpoint: +d.midpoint
    };
}).then(data => {
    dataset = data
    console.log(dataset)
    createScales()
    setTimeout(drawInitial(), 100)
})

const colors = ['#ffcc00', '#ff6666', '#cc0066', '#66cccc', '#f688bb', '#65587f', '#baf1a1', '#333333', '#75b79e', '#66cccc', '#9de3d0', '#f1935c', '#0c7b93', '#eab0d9', '#baf1a1', '#9399ff']

//Create all the scales and save to global variables

function createScales() {
    salarySizeScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [5, 35])
    salaryXScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [margin.left, margin.left + width + 250])
    salaryYScale = d3.scaleLinear([20000, 110000], [margin.top + height, margin.top])
    categoryColorScale = d3.scaleOrdinal(categories, colors)
    shareWomenXScale = d3.scaleLinear(d3.extent(dataset, d => d.ShareWomen), [margin.left, margin.left + width])
    enrollmentScale = d3.scaleLinear(d3.extent(dataset, d => d.Total), [margin.left + 120, margin.left + width - 50])
    enrollmentSizeScale = d3.scaleLinear(d3.extent(dataset, d => d.Total), [10, 60])
    histXScale = d3.scaleLinear(d3.extent(dataset, d => d.Midpoint), [margin.left, margin.left + width])
    histYScale = d3.scaleLinear(d3.extent(dataset, d => d.HistCol), [margin.top + height, margin.top])
}

function createLegend(x, y) {
    let svg = d3.select('#legend')

    svg.append('g')
        .attr('class', 'categoryLegend')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend = d3.legendColor()
        .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
        .shapePadding(10)
        .scale(categoryColorScale)

    d3.select('.categoryLegend')
        .call(categoryLegend)
}

function createSizeLegend() {
    let svg = d3.select('#legend2')
    svg.append('g')
        .attr('class', 'sizeLegend')
        .attr('transform', `translate(100,50)`)

    sizeLegend2 = d3.legendSize()
        .scale(salarySizeScale)
        .shape('circle')
        .shapePadding(15)
        .title('Salary Scale')
        .labelFormat(d3.format("$,.2r"))
        .cells(7)

    d3.select('.sizeLegend')
        .call(sizeLegend2)
}

function createSizeLegend2() {
    let svg = d3.select('#legend3')
    svg.append('g')
        .attr('class', 'sizeLegend2')
        .attr('transform', `translate(50,100)`)

    sizeLegend2 = d3.legendSize()
        .scale(enrollmentSizeScale)
        .shape('circle')
        .shapePadding(55)
        .orient('horizontal')
        .title('Enrolment Scale')
        .labels(['1000', '200000', '400000'])
        .labelOffset(30)
        .cells(3)

    d3.select('.sizeLegend2')
        .call(sizeLegend2)
}

// All the initial elements should be create in the drawInitial function
// As they are required, their attributes can be modified
// They can be shown or hidden using their 'opacity' attribute
// Each element should also have an associated class name for easy reference

function drawInitial() {
    createSizeLegend()
    createSizeLegend2()

    let svg = d3.select("#vis")
        .append('svg')
        .attr('width', 1000)
        .attr('height', 950)
        .attr('opacity', 1)

    let xAxis = d3.axisBottom(salaryXScale)
        .ticks(4)
        .tickSize(height + 80)

    let xAxisGroup = svg.append('g')
        .attr('class', 'first-axis')
        .attr('transform', 'translate(0, 0)')
        .call(xAxis)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
        .attr('stroke-opacity', 0.2)
        .attr('stroke-dasharray', 2.5)

    // Instantiates the force simulation
    // Has no forces. Actual forces are added and removed as required

    simulation = d3.forceSimulation(dataset)

    // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })

    // Stop the simulation until later
    simulation.stop()

    // Selection of all the circles 
    nodes = svg
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('fill', 'black')
        .attr('r', 3)
        .attr('cx', (d, i) => salaryXScale(d.Median) + 5)
        .attr('cy', (d, i) => i * 5.2 + 30)
        .attr('opacity', 0.8)

    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)
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