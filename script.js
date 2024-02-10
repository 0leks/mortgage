// https://observablehq.com/@wattenberger2/creating-custom-data-visualizations-using-d3-js
const INTEREST_PAYMENT = "INT";
const PRINCIPAL_PAYMENT = "PRI";
const HOVERED_COLOR = "red";

let monthlyPayment = 0;

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
        viewUpToMonth: viewUpToYear * 12
    }
}

function generateData(inputs) {

    let mortgageLengthInYears = 30;
    
    // Computation
    let monthlyInterest = inputs.interestRate / 12;
    let mortgageLengthInMonths = mortgageLengthInYears * 12;
    let exponent = Math.pow(1 + monthlyInterest, mortgageLengthInMonths);
    monthlyPayment = inputs.loanAmount * monthlyInterest * exponent / (exponent - 1)
    console.log(`mortgageLengthInYears: ${mortgageLengthInYears}`)
    console.log(`monthlyInterest: ${monthlyInterest}`)
    console.log(`mortgageLengthInMonths: ${mortgageLengthInMonths}`)
    console.log(`exponent: ${exponent}`)
    console.log(`monthlyPayment: ${monthlyPayment}`)
    let firstInterestPayment = inputs.loanAmount * monthlyInterest;

    let nextInterestPayment = firstInterestPayment;
    let latestRemainingPrincipal = inputs.loanAmount;
    let totalInterestPaid = inputs.closingCosts;
    let dataArray = [];
    for (let month = 0; month < mortgageLengthInMonths; month++) {
        totalInterestPaid = totalInterestPaid + nextInterestPayment;
        let newDatum = {
            month: month,
            interestPayment: nextInterestPayment,
            principalPayment: monthlyPayment - nextInterestPayment,
            interestPaid: totalInterestPaid,
            monthlyPayment: monthlyPayment
        };
        latestRemainingPrincipal = latestRemainingPrincipal - newDatum.principalPayment;
        nextInterestPayment = latestRemainingPrincipal * monthlyInterest;
        dataArray.push(newDatum);
    }

    return dataArray;
}

interestPaymentAccessor = d => d.interestPayment
principalPaymentAccessor = d => d.principalPayment
interestPaidAccessor = d => d.interestPaid
xAccessor = d => d.month

let margins = {top: 10, right: 170, bottom: 50, left: 70}
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
                    .style("fill", d => legendColor(d))
                    .attr("x", 10 + 20 + 5)
                    .attr("y", (d, i) => 25 + i*(20+5) + 20/2)
                    .text(d => d)
            }
        )
}

let monthlyKeys = ["interestPayment", "principalPayment", "monthlyPayment"]
let aggregateKeys = ["interestPaid"]
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
    xScale = d3.scaleLinear()
        .domain([firstDate, lastDate])
        .range([0, monthlyBoundsWidth])

    let minPayment = 0
    let maxPayment = Math.ceil(monthlyPayment*1.05)
    monthlyyScale = d3.scaleLinear()
        .domain([minPayment, maxPayment])
        .range([monthlyBoundsHeight, 0])
        
    let minInterestPaid = 0
    let maxInterestPaid = d3.max(data.slice(firstDate,lastDate), interestPaidAccessor) * 1.05
    aggregateyScale = d3.scaleLinear()
        .domain([minInterestPaid, maxInterestPaid])
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
                            .y(function(d) { return aggregateyScale(interestPaidAccessor(d)) }))
                },
                update => {
                    return update.transition().duration(750)
                        .attr("d", d3.line()
                            .x(function(d) { return xScale(xAccessor(d)) })
                            .y(function(d) { return aggregateyScale(interestPaidAccessor(d)) }))
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

    // columnsGroup.selectAll(".principalLine")
    //     .data([data], d => d.month)
    //     .join(
    //         enter => {
    //             return enter.append("path")
    //                 .attr("class", "principalLine")
    //                 .attr("fill", "none")
    //                 .attr("stroke", legendColor("principalPayment"))
    //                 .attr("stroke-width", 1.5)
    //                 .attr("d", d3.line()
    //                     .x(function(d) { return xScale(xAccessor(d)) })
    //                     .y(function(d) { return yScale(principalPaymentAccessor(d)) }))
    //         },
    //         update => {
    //             return update.transition().duration(750)
    //                 .attr("d", d3.line()
    //                     .x(function(d) { return xScale(xAccessor(d)) })
    //                     .y(function(d) { return yScale(principalPaymentAccessor(d)) }))
    //         },
    //         exit => {}
    //     )

    // columnsGroup.selectAll(".column")
    //     .data(data)
    //     .join(
    //         function(enter) {
    //             console.log('enter');
    //             console.log(enter);
    //             const column = enter.append("g").attr("class", "column");
    //             console.log('column');
    //             console.log(column);
    //             column.append("rect")
    //                 .attr("class", "interest-payment-rect")
    //                 .attr("x", d => xScale(xAccessor(d)))
    //                 .attr("y", d => yScale(interestPaymentAccessor(d)))
    //                 .attr("width", columnWidth)
    //                 .attr("height", d => yScale(0) - yScale(interestPaymentAccessor(d)))
    //             column
    //                 .append("rect")
    //                 .attr("class", "principal-payment-rect")
    //                 .attr("x", d => xScale(xAccessor(d)) + 2)
    //                 .attr("y", d => yScale(principalPaymentAccessor(d)))
    //                 .attr("width", columnWidth)
    //                 .attr("height", d => yScale(0) - yScale(principalPaymentAccessor(d)))
    //             column
    //                 .append("circle")
    //                 .attr("class", "monthly-payment-circle")
    //                 .attr("cx", d => xScale(xAccessor(d)) + 2)
    //                 .attr("cy", d => yScale(monthlyPayment))
    //                 .attr("r", columnWidth)
    //             return column;
    //         },
    //         function(update) {
    //             console.log('update');
    //             console.log(update);
    //             update.select(".interest-payment-rect")
    //             .transition().duration(750)
    //                 .attr("x", d => xScale(xAccessor(d)))
    //                 .attr("y", d => yScale(interestPaymentAccessor(d)))
    //                 .attr("width", columnWidth)
    //                 .attr("height", d => yScale(0) - yScale(interestPaymentAccessor(d)))
    //             update.select(".principal-payment-rect")
    //             .transition().duration(750)
    //                 .attr("x", d => xScale(xAccessor(d)) + 2)
    //                 .attr("y", d => yScale(principalPaymentAccessor(d)))
    //                 .attr("width", columnWidth)
    //                 .attr("height", d => yScale(0) - yScale(principalPaymentAccessor(d)))
    //             update.select(".monthly-payment-circle")
    //                 .transition().duration(750)
    //                 .attr("cx", d => xScale(xAccessor(d)) + 2)
    //                 .attr("cy", d => yScale(monthlyPayment))
    //                 .attr("r", columnWidth)
    //             return update
    //         },
    //         function (exit) {}
    //     )

    let xAxisGenerator = d3.axisBottom()
        .scale(xScale)
        .tickValues(d3.range(0, 361, 12))
        .tickFormat(x => `${x/12}`)
    monthlyxAxisGroup.transition().duration(750).call(xAxisGenerator)
    aggregatexAxisGroup.call(xAxisGenerator)

    let xAxisGridGenerator = d3.axisBottom()
        .scale(xScale)
        .tickSize(-monthlyBoundsHeight)
        .tickValues(d3.range(0, 361, 12))
        .tickFormat('')
    monthlyxAxisGridGroup.call(xAxisGridGenerator)
    aggregatexAxisGridGroup.call(xAxisGridGenerator)
    
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
}
refreshData();

const monthly_mouse_g = monthlyParentGroup.append('g').classed('mouse', true).style('display', 'none');
  monthly_mouse_g.append('rect').attr('width', 2).attr('x',0).attr('height', monthlyBoundsHeight).attr('fill', 'black');
  monthly_mouse_g.append('text').classed('monthText', true).attr('transform', `translate(0, ${margins.top + monthlyBoundsHeight})`);

for (let key of monthlyKeys) {
  monthly_mouse_g.append('circle').classed(`${key}Circle`, true).attr('r', 6).attr("fill", legendColor(key));
  monthly_mouse_g.append('text').classed(`${key}Text`, true).attr('transform', `translate(0, ${margins.top})`);
}

const aggregate_mouse_g = aggregateParentGroup.append('g').classed('mouse', true).style('display', 'none');
  aggregate_mouse_g.append('rect').attr('width', 2).attr('x',0).attr('height', monthlyBoundsHeight).attr('fill', 'black');
  aggregate_mouse_g.append('text').classed('monthText', true).attr('transform', `translate(0, ${margins.top + monthlyBoundsHeight})`);

for (let key of aggregateKeys) {
    aggregate_mouse_g.append('circle').classed(`${key}Circle`, true).attr('r', 6).attr("fill", legendColor(key));
    aggregate_mouse_g.append('text').classed(`${key}Text`, true).attr('transform', `translate(0, ${margins.top})`);
}

let hoveredDatum = null;
monthlyParentGroup
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut)
aggregateParentGroup
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut)

function handleMouseOver (event) {
    // mouse_g.style("display", "block");
    // d3.select(this).selectAll(".interest-payment-rect")
    //     .attr("class", "interest-payment-rect interest-payment-rect-hovered");
    // d3.select(this).selectAll(".principal-payment-rect")
    //     .attr("class", "principal-payment-rect principal-payment-rect-hovered");
};
function handleMouseMove(event) {
    // console.log(event.x - margins.left)
    let hoveredMonth = Math.floor(xScale.invert(event.x - margins.left))
    let hoveredDatum = data.find(d => d.month === hoveredMonth)
    // console.log(hoveredDatum)
    if (!hoveredDatum) {
        handleMouseOut(event);
        return;
    }
    monthly_mouse_g.style("display", "block");
    monthly_mouse_g.attr("transform", `translate(${xScale(hoveredMonth)}, 0)`)
    monthly_mouse_g.select(".monthText").text(`${hoveredMonth}`)
            .attr("transform", `translate(10, ${monthlyBoundsHeight})`)

    for (let key of monthlyKeys) {
        monthly_mouse_g.select(`.${key}Circle`).attr('cy', monthlyyScale(hoveredDatum[key]))
        monthly_mouse_g.select(`.${key}Text`).text(`$${hoveredDatum[key].toFixed(0)}`)
                .attr("transform", `translate(10, ${monthlyyScale(hoveredDatum[key])})`)
    }
        
    aggregate_mouse_g.style("display", "block");
    aggregate_mouse_g.attr("transform", `translate(${xScale(hoveredMonth)}, 0)`)

    aggregate_mouse_g.select(".monthText").text(`${hoveredMonth}`)
            .attr("transform", `translate(10, ${monthlyBoundsHeight})`)
        
    for (let key of aggregateKeys) {
        aggregate_mouse_g.select(`.${key}Circle`).attr('cy', aggregateyScale(hoveredDatum[key]))
        aggregate_mouse_g.select(`.${key}Text`).text(`$${hoveredDatum[key].toFixed(0)}`)
                .attr("transform", `translate(10, ${aggregateyScale(hoveredDatum[key])})`)
    }
}
function handleMouseOut (event) {
    monthly_mouse_g.style("display", "none");
    aggregate_mouse_g.style("display", "none");
};
