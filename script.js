// https://observablehq.com/@wattenberger2/creating-custom-data-visualizations-using-d3-js

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth();

let monthlyPayment = 0;
let requestedZoomOnAggregateInterestPaid = null;
let oldRequestedZoomOnAggregateInterestPaid = null;

function parseInputs() {
    let loanAmountElement = document.getElementById("loanAmount");
    let loanAmount = 0;
    if (!loanAmountElement.value.trim().length) {
        loanAmount = parseInt(loanAmountElement.placeholder)
    }
    else {
        loanAmount = parseInt(loanAmountElement.value)
    }
    
    let interestRate = 0;
    let interestRateElement = document.getElementById("interestRate");
    if (!interestRateElement.value.trim().length) {
        interestRate = parseFloat(interestRateElement.placeholder)
    }
    else {
        interestRate = parseFloat(interestRateElement.value)
    }
    
    let closingCosts = 0;
    let closingCostsElement = document.getElementById("closingCosts");
    if (!closingCostsElement.value.trim().length) {
        closingCosts = parseFloat(closingCostsElement.placeholder)
    }
    else {
        closingCosts = parseFloat(closingCostsElement.value)
    }
    
    let viewUpToYear = 0;
    let viewUpToYearElement = document.getElementById("viewUpToYear");
    if (!viewUpToYearElement.value.trim().length) {
        viewUpToYear = parseFloat(viewUpToYearElement.placeholder)
    }
    else {
        viewUpToYear = parseFloat(viewUpToYearElement.value)
    }

    return {
        loanAmount: loanAmount,
        interestRate: interestRate * 0.01,
        closingCosts: closingCosts,
        viewUpToMonth: viewUpToYear * 12,
        buydownOptions: [{
            name: "A",
            interestRate: .06625,
            cost: 0,
        }, {
            name: "B",
            interestRate: .06375,
            cost: 7574,
        }, {
            name: "C",
            interestRate: .06125,
            cost: 11324,
        }]
    }
}

function generateData(inputs) {

    let mortgageLengthInYears = 30;
    let mortgageLengthInMonths = mortgageLengthInYears * 12;
    
    // Computation
    let optionValues = []
    for (let option of inputs.buydownOptions) {
        let monthlyInterest = option.interestRate / 12;
        let exponent = Math.pow(1 + monthlyInterest, mortgageLengthInMonths);
        let monthlyPayment = inputs.loanAmount * monthlyInterest * exponent / (exponent - 1)
        let totalInterestPaid = inputs.closingCosts + option.cost;
        let principalRemaining = inputs.loanAmount;
        optionValues.push({
            name: option.name,
            monthlyInterest: monthlyInterest,
            monthlyPayment: monthlyPayment,
            totalInterestPaid: totalInterestPaid,
            principalRemaining: principalRemaining,
        })
    }
    // let monthlyInterest = inputs.interestRate / 12;
    // let exponent = Math.pow(1 + monthlyInterest, mortgageLengthInMonths);
    // monthlyPayment = inputs.loanAmount * monthlyInterest * exponent / (exponent - 1)
    // console.log(`mortgageLengthInYears: ${mortgageLengthInYears}`)
    // console.log(`monthlyInterest: ${monthlyInterest}`)
    // console.log(`mortgageLengthInMonths: ${mortgageLengthInMonths}`)
    // console.log(`exponent: ${exponent}`)
    // console.log(`monthlyPayment: ${monthlyPayment}`)

    let dataArray = [];
    for (let month = 0; month < mortgageLengthInMonths; month++) {
        let datum = {
            month: month,
        }
        for (let optionValue of optionValues) {
            let interestPayment = optionValue.principalRemaining * optionValue.monthlyInterest;
            let principalPayment = optionValue.monthlyPayment - interestPayment;
            optionValue.totalInterestPaid += interestPayment;
            optionValue.principalRemaining -= principalPayment;

            datum[`${optionValue.name}monthlyPayment`] = optionValue.monthlyPayment;
            datum[`${optionValue.name}interestPayment`] = interestPayment;
            datum[`${optionValue.name}principalPayment`] = principalPayment;

            datum[`${optionValue.name}interestPaid`] = optionValue.totalInterestPaid;
            datum[`${optionValue.name}principalRemaining`] = optionValue.principalRemaining;
        }
        dataArray.push(datum);
        // let interestPayment = principalRemaining * monthlyInterest;
        // let principalPayment = monthlyPayment - interestPayment;
        // totalInterestPaid += interestPayment;
        // principalRemaining -= principalPayment;
        // dataArray.push({
        //     month: month,
        //     interestPayment: interestPayment,
        //     principalPayment: principalPayment,
        //     interestPaid: totalInterestPaid,
        //     monthlyPayment: monthlyPayment,
        //     principalRemaining: principalRemaining,
        // });
    }

    return dataArray;
}

interestPaymentAccessor = d => d.interestPayment
principalPaymentAccessor = d => d.principalPayment
interestPaidAccessor = d => d.interestPaid
xAccessor = d => d.month

let margins = {top: 10, right: 200, bottom: 50, left: 70}
let monthlyPayments_svg = document.getElementById("monthlyPayments_svg");
let monthlyBoundsWidth = monthlyPayments_svg.getBoundingClientRect().width - margins.left - margins.right;
let monthlyBoundsHeight = monthlyPayments_svg.getBoundingClientRect().height - margins.top - margins.bottom;

let monthlyParentGroup = d3.select("#monthlyPayments_svg").select(".parent")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)
monthlyParentGroup.append('rect')
    .attr('width', monthlyBoundsWidth).attr('height', monthlyBoundsHeight)
    .attr('fill', 'blue').attr('fill-opacity', 0.00);
let monthlyDataGroup = monthlyParentGroup.select(".data")
let monthlyxAxisGroup = monthlyParentGroup.select(".xaxis")
        .attr("transform", `translate(0, ${monthlyBoundsHeight})`)
let monthlyxAxisGridGroup = monthlyParentGroup.select(".xaxisGrid")
        .attr("transform", `translate(0, ${monthlyBoundsHeight})`)
let monthlyyAxisGroup = monthlyParentGroup.select(".yaxis")
let monthlyyAxisGridGroup = monthlyParentGroup.select(".yaxisGrid")


function addLegend(parentGroup, keys) {
    let legendGroup = parentGroup.select(".legend");
    legendGroup.attr("transform", `translate(${monthlyBoundsWidth + 10}, 0)`)
    legendGroup.append("text")
        .text("legend")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .attr("y", (d, i) => 20/2)
    legendGroup.selectAll(".legendDot")
        .data(keys)
        .join(
            enter => {
                enter.append("rect").classed("legendDot", true)
                    .style("fill", d => legendColor(d))
                    .attr("x", 10)
                    .attr("y", (d, i) => 25 + i*(20+5))
                    .attr("width", 20)
                    .attr("height", 20)
            }
        )
    legendGroup.selectAll(".legendText")
        .data(keys)
        .join(
            enter => {
                enter.append("text").classed("legendText", true)
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")
                    .style("fill", "black")
                    .attr("x", 10 + 20 + 5)
                    .attr("y", (d, i) => 25 + i*(20+5) + 20/2)
                    .text(d => d)
            }
        )
}

let inputs = parseInputs();
let monthlyKeys = [];
let aggregateKeys = []
for (let option of inputs.buydownOptions) {
    monthlyKeys.push(`${option.name}monthlyPayment`);
    monthlyKeys.push(`${option.name}interestPayment`);
    monthlyKeys.push(`${option.name}principalPayment`);

    aggregateKeys.push(`${option.name}interestPaid`);
    aggregateKeys.push(`${option.name}principalRemaining`);
}
// let monthlyKeys = ["interestPayment", "principalPayment", "monthlyPayment"]
// let aggregateKeys = ["interestPaid", "principalRemaining"]
let allTheKeys = monthlyKeys.concat(aggregateKeys)
console.log(allTheKeys)
var legendColor = d3.scaleOrdinal()
  .domain(allTheKeys)
  .range(d3.schemeSet1);

let aggregatePayments_svg = document.getElementById("aggregatePayments_svg");
let aggregateBoundsWidth = aggregatePayments_svg.getBoundingClientRect().width - margins.left - margins.right;
let aggregateBoundsHeight = aggregatePayments_svg.getBoundingClientRect().height - margins.top - margins.bottom;
let aggregateParentGroup = d3.select("#aggregatePayments_svg").select(".parent")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)
aggregateParentGroup.append('rect')
    .attr('width', monthlyBoundsWidth).attr('height', monthlyBoundsHeight)
    .attr('fill', 'blue').attr('fill-opacity', 0.00);
let aggregateDataGroup = aggregateParentGroup.select(".data")
let aggregatexAxisGroup = aggregateParentGroup.select(".xaxis")
        .attr("transform", `translate(0, ${aggregateBoundsHeight})`)
let aggregatexAxisGridGroup = aggregateParentGroup.select(".xaxisGrid")
        .attr("transform", `translate(0, ${aggregateBoundsHeight})`)
let aggregateyAxisGroup = aggregateParentGroup.select(".yaxis")
let aggregateyAxisGridGroup = aggregateParentGroup.select(".yaxisGrid")

addLegend(monthlyParentGroup, monthlyKeys)
addLegend(aggregateParentGroup, aggregateKeys)

let xScale = null;
let data = null;
let monthlyyScale = null;
let aggregateyScale;
function refreshData() {
    // Inputs
    let inputs = parseInputs();
    console.log(inputs)

    data = generateData(inputs);
    console.log(data)
    
    let firstDate = d3.min(data, xAccessor)
    let lastDate = Math.min(d3.max(data, xAccessor) + 5, inputs.viewUpToMonth)
    if (requestedZoomOnAggregateInterestPaid != null) {
        firstDate = requestedZoomOnAggregateInterestPaid.start;
        lastDate = requestedZoomOnAggregateInterestPaid.end
    }
    xScale = d3.scaleLinear()
        .domain([firstDate, lastDate])
        .range([0, monthlyBoundsWidth])

    let minPayment = 0
    let maxPayment = 0;
    for (let key of monthlyKeys) {
        maxPayment = Math.max(maxPayment, d3.max(data.slice(firstDate,lastDate), d => d[key]))
    }
    maxPayment = maxPayment * 1.05;
    monthlyyScale = d3.scaleLinear()
        .domain([minPayment, maxPayment])
        .range([monthlyBoundsHeight, 0])
        
    let maxAggregate = 0
    let minAggregate = Number.MAX_SAFE_INTEGER
    let dataSlice = data.slice(firstDate,lastDate);
    let zoomRange = 12;
    // if (requestedZoomOnAggregateInterestPaid != null) {
    //     dataSlice = data.slice(
    //             requestedZoomOnAggregateInterestPaid.start, requestedZoomOnAggregateInterestPaid.end + 1);
    // }
    for (let key of aggregateKeys) {
        console.log(key)
        if (!key.endsWith("interestPaid"))
        {
            continue;
        }
        maxAggregate = Math.max(maxAggregate, d3.max(dataSlice, d => d[key]))
        minAggregate = Math.min(minAggregate, d3.min(dataSlice, d => d[key]))
    }
    if (minAggregate == null) {
        minAggregate = 0;
    }
    else {
        minAggregate = minAggregate * 0.97;
    }
    maxAggregate = maxAggregate * 1.03;
    aggregateyScale = d3.scaleLinear()
        .domain([minAggregate, maxAggregate])
        .range([aggregateBoundsHeight, 0])

    let fullColumnWidth = xScale(xAccessor(data[1])) - xScale(xAccessor(data[0]))
    let columnWidth = Math.floor(fullColumnWidth / 2)
    // let columnWidth = 2
    for (let key of aggregateKeys) {
        aggregateDataGroup.selectAll(`.${key}`)
            .data([data], d => d.month)
            .join(
                enter => {
                    return enter.append("path")
                        .attr("class", key)
                        .attr("fill", "none")
                        .attr("stroke", legendColor(key))
                        .attr("stroke-width", 1.5)
                        .attr("d", d3.line()
                            .x(function(d) { return xScale(xAccessor(d)) })
                            .y(function(d) { return aggregateyScale(d[key]) }))
                },
                update => {
                    return update.transition().duration(750)
                        .attr("d", d3.line()
                            .x(function(d) { return xScale(xAccessor(d)) })
                            .y(function(d) { return aggregateyScale(d[key]) }))
                },
                exit => {}
            )
    }

    for (let key of monthlyKeys) {
        monthlyDataGroup.selectAll(`.${key}`)
            .data([data], d => d.month)
            .join(
                enter => {
                    return enter.append("path")
                        .attr("class", key)
                        .attr("fill", "none")
                        .attr("stroke", legendColor(key))
                        .attr("stroke-width", 1.5)
                        .attr("d", d3.line()
                            .x(function(d) { return xScale(xAccessor(d)) })
                            .y(function(d) { return monthlyyScale(d[key]) }))
                            // .y(function(d) { return yScale(interestPaymentAccessor(d)) }))
                },
                update => {
                    return update.transition().duration(750)
                        .attr("d", d3.line()
                            .x(function(d) { return xScale(xAccessor(d)) })
                            .y(function(d) { return monthlyyScale(d[key]) }))
                },
                exit => {}
            )
    }
    let xAxisTickValues = d3.range(12 - CURRENT_MONTH, 361, 12);
    Array.prototype.unshift.apply(xAxisTickValues, [0]);
    console.log(xAxisTickValues)
    let xAxisGenerator = d3.axisBottom()
        .scale(xScale)
        .tickValues(xAxisTickValues)
        // .tickFormat(x => `${x/12}`)
        .tickFormat(x => `${CURRENT_YEAR + Math.floor((x + CURRENT_MONTH)/12)}`)
    monthlyxAxisGroup.transition().duration(750).call(xAxisGenerator)
    aggregatexAxisGroup.transition().duration(750).call(xAxisGenerator)

    let xAxisGridGenerator = d3.axisBottom()
        .scale(xScale)
        .tickSize(-monthlyBoundsHeight)
        .tickValues(xAxisTickValues)
        .tickFormat('')
    monthlyxAxisGridGroup.transition().duration(750).call(xAxisGridGenerator)
    aggregatexAxisGridGroup.transition().duration(750).call(xAxisGridGenerator)
    
    let yAxisGenerator = d3.axisLeft()
        .scale(monthlyyScale)
        .ticks(15)
    monthlyyAxisGroup.transition().duration(750).call(yAxisGenerator)
    
    let yAxisGridGenerator = d3.axisLeft()
        .scale(monthlyyScale)
        .ticks(15)
        .tickSize(-monthlyBoundsWidth)
        .tickFormat('')
    monthlyyAxisGridGroup.transition().duration(750).call(yAxisGridGenerator)

    
    let interestpaid_yAxisGenerator = d3.axisLeft()
        .scale(aggregateyScale)
        .ticks(15)
        .tickFormat(x => `${x/1000}K`)
    aggregateyAxisGroup.transition().duration(750).call(interestpaid_yAxisGenerator)
    
    let interestPaid_yAxisGridGenerator = d3.axisLeft()
        .scale(aggregateyScale)
        .ticks(20)
        .tickSize(-monthlyBoundsWidth)
        .tickFormat('')
    aggregateyAxisGridGroup.transition().duration(750).call(interestPaid_yAxisGridGenerator)
    
    console.log(oldRequestedZoomOnAggregateInterestPaid)
    if (requestedZoomOnAggregateInterestPaid != null && requestedZoomOnAggregateInterestPaid.complete)
    {
        zoom_box_g.select(".zoomBox").transition().duration(750)
                .attr("x", 0)
                .attr("width", xScale(requestedZoomOnAggregateInterestPaid.end) - xScale(requestedZoomOnAggregateInterestPaid.start))
                .attr('opacity', 0)
    }
    else if (oldRequestedZoomOnAggregateInterestPaid != null && oldRequestedZoomOnAggregateInterestPaid.complete == false) {
        console.log("doing anim")
        zoom_box_g.select(".zoomBox").transition().duration(750)
                .attrTween('opacity', () => d3.interpolateBasis([0, 0.2, 0]))
                .attr("x", xScale(oldRequestedZoomOnAggregateInterestPaid.start))
                .attr("width", xScale(oldRequestedZoomOnAggregateInterestPaid.end) - xScale(oldRequestedZoomOnAggregateInterestPaid.start))
                .transition().duration(100)
                .attr('opacity', 0)
         oldRequestedZoomOnAggregateInterestPaid.complete = true;
    }
}

const monthly_mouse_g = monthlyParentGroup.select('.mouse').style('display', 'none');
  monthly_mouse_g.append('rect').attr('width', 2).attr('x',0).attr('height', monthlyBoundsHeight).attr('fill', 'black');
  monthly_mouse_g.append('text').classed('monthText', true)//.attr('transform', `translate(0, ${monthlyBoundsHeight})`);
            .attr("transform", `translate(5, ${monthlyBoundsHeight - 2})`)
            .attr("text-anchor", "left")

for (let key of monthlyKeys) {
    monthly_mouse_g.append('circle').classed(`${key}Circle`, true).attr('r', 6).attr("fill", legendColor(key));
    monthly_mouse_g.append('text').classed(`${key}Text`, true).attr('transform', `translate(0, ${margins.top})`)
                    .style("alignment-baseline", "middle")
}

const aggregate_mouse_g = aggregateParentGroup.select('.mouse').style('display', 'none');
  aggregate_mouse_g.append('rect').attr('width', 2).attr('x',0).attr('height', monthlyBoundsHeight).attr('fill', 'black');
  aggregate_mouse_g.append('text').classed('monthText', true)//.attr('transform', `translate(0, ${margins.top + monthlyBoundsHeight})`)
            .attr("transform", `translate(5, ${aggregateBoundsHeight - 2})`)
            .attr("text-anchor", "left")

for (let key of aggregateKeys) {
    aggregate_mouse_g.append('circle').classed(`${key}Circle`, true).attr('r', 6).attr("fill", legendColor(key));
    aggregate_mouse_g.append('text').classed(`${key}Text`, true).attr('transform', `translate(0, ${margins.top})`)
                .style("alignment-baseline", "middle")
}


const zoom_box_g = aggregateParentGroup.select('.zoomBoxGroup').style('display', 'none');
  zoom_box_g.append('rect').classed('zoomBox', true)
        .attr('height', monthlyBoundsHeight)
        .attr('fill', 'black')
        .attr('width', 0)
        .attr('opacity', .2)


let hoveredDatum = null;
monthlyParentGroup
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut)
aggregateParentGroup
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut)
    .on("mouseup", handleMouseUp)
    .on("mousedown", handleMouseDown)

function getHoveredMonth(event) {
    return Math.floor(xScale.invert(event.x - margins.left))
}

function handleMouseDown(event) {
    if (requestedZoomOnAggregateInterestPaid == null) {
        requestedZoomOnAggregateInterestPaid = {
            down: getHoveredMonth(event),
            up: getHoveredMonth(event),
            complete: false,
        }
        updateZoomStartEnd();
        zoom_box_g.style('display', 'block')
        zoom_box_g.select(".zoomBox")
                .attr("x", xScale(requestedZoomOnAggregateInterestPaid.start))
                .attr("width", xScale(requestedZoomOnAggregateInterestPaid.end) - xScale(requestedZoomOnAggregateInterestPaid.start))
                .attr('opacity', .2)
    }
    else {
        oldRequestedZoomOnAggregateInterestPaid = requestedZoomOnAggregateInterestPaid;
        oldRequestedZoomOnAggregateInterestPaid.complete = false;
        requestedZoomOnAggregateInterestPaid = null;
        // zoom_box_g.style('display', 'none')
        refreshData()
    }
}
function updateZoomStartEnd() {
    const MINIMUM_ZOOM_RANGE = 2;
    requestedZoomOnAggregateInterestPaid.start = Math.min(requestedZoomOnAggregateInterestPaid.down, requestedZoomOnAggregateInterestPaid.up);
    requestedZoomOnAggregateInterestPaid.end = Math.max(requestedZoomOnAggregateInterestPaid.down, requestedZoomOnAggregateInterestPaid.up);
    requestedZoomOnAggregateInterestPaid.start = Math.min(requestedZoomOnAggregateInterestPaid.end - MINIMUM_ZOOM_RANGE, requestedZoomOnAggregateInterestPaid.start)
    requestedZoomOnAggregateInterestPaid.end = Math.max(requestedZoomOnAggregateInterestPaid.end, requestedZoomOnAggregateInterestPaid.start + MINIMUM_ZOOM_RANGE*2)
}
function handleMouseUp(event) {
    if (requestedZoomOnAggregateInterestPaid != null && requestedZoomOnAggregateInterestPaid.complete == false) {
        requestedZoomOnAggregateInterestPaid.up = getHoveredMonth(event)
        requestedZoomOnAggregateInterestPaid.complete = true
        updateZoomStartEnd();
        zoom_box_g.select(".zoomBox")
                .attr("x", xScale(requestedZoomOnAggregateInterestPaid.start))
                .attr("width", xScale(requestedZoomOnAggregateInterestPaid.end) - xScale(requestedZoomOnAggregateInterestPaid.start))
        refreshData()
    }
}

function handleMouseOver (event) {
    // mouse_g.style("display", "block");
    // d3.select(this).selectAll(".interest-payment-rect")
    //     .attr("class", "interest-payment-rect interest-payment-rect-hovered");
    // d3.select(this).selectAll(".principal-payment-rect")
    //     .attr("class", "principal-payment-rect principal-payment-rect-hovered");
};
function handleMouseMove(event) {
    // console.log(event.x - margins.left)
    let hoveredMonth = getHoveredMonth(event)
    let hoveredDatum = data.find(d => d.month === hoveredMonth)
    // console.log(hoveredDatum)
    if (!hoveredDatum) {
        handleMouseOut(event);
        return;
    }
    monthly_mouse_g.style("display", "block");
    monthly_mouse_g.attr("transform", `translate(${xScale(hoveredMonth)}, 0)`)
    monthly_mouse_g.select(".monthText").text(`${MONTHS[(hoveredMonth + CURRENT_MONTH)%12]}`)

    for (let key of monthlyKeys) {
        monthly_mouse_g.select(`.${key}Circle`).attr('cy', monthlyyScale(hoveredDatum[key]))
        monthly_mouse_g.select(`.${key}Text`).text(`$${hoveredDatum[key].toFixed(0)}`)
                .attr("transform", `translate(10, ${monthlyyScale(hoveredDatum[key])})`)
    }
        
    aggregate_mouse_g.style("display", "block");
    aggregate_mouse_g.attr("transform", `translate(${xScale(hoveredMonth)}, 0)`)

    aggregate_mouse_g.select(".monthText").text(`${MONTHS[(hoveredMonth + CURRENT_MONTH)%12]}`)
        
    for (let key of aggregateKeys) {
        aggregate_mouse_g.select(`.${key}Circle`).attr('cy', aggregateyScale(hoveredDatum[key]))
        aggregate_mouse_g.select(`.${key}Text`).text(`$${hoveredDatum[key].toFixed(0)}`)
                .attr("transform", `translate(10, ${aggregateyScale(hoveredDatum[key])})`)
                .style("alignment-baseline", "middle")
    }

    if (requestedZoomOnAggregateInterestPaid != null && requestedZoomOnAggregateInterestPaid.complete == false) {
        requestedZoomOnAggregateInterestPaid.up = getHoveredMonth(event)
        updateZoomStartEnd();
        zoom_box_g.select(".zoomBox").attr("x", xScale(requestedZoomOnAggregateInterestPaid.start))
        zoom_box_g.select(".zoomBox").attr("width", xScale(requestedZoomOnAggregateInterestPaid.end) - xScale(requestedZoomOnAggregateInterestPaid.start))
        // refreshData()
    }
}
function handleMouseOut (event) {
    monthly_mouse_g.style("display", "none");
    aggregate_mouse_g.style("display", "none");
    handleMouseUp(event)
};

refreshData();
