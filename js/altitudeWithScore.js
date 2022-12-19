// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


async function getCoffeeInfo() {
    const coffeeData = await d3.csv("../data/beanData.csv");
    const farms = new Set();
    const test = coffeeData.filter((d) => {
        let marked = false
        const farmName = d.Farm_Name;
        if (farmName in farms) {
            marked = true;
        } else {
            farms.add(farmName);
        }

        return marked || !isNaN(Number(d.altitude_mean_meters));
    });
    return test;
}


async function drawPlot(data) {
    // Color scale: return a color for a given region name
    const color = d3.scaleOrdinal()
        .domain(["Africa", "Asia", "CentralA", "NorthA", "Pacific", "SouthA"])
        .range(["#440154ff", "#21908dff", "#fde725ff", "#FFC0CB", "#0096FF", "#EE4B2B"]);

    // Add X axis
    const x = d3.scaleLinear()
        .domain([57, 91])
        .range([0, width])
    const x_axis = d3.axisBottom(x);
    const x_axisElements = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(x_axis);

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 4500])
        .range([height, 0]);
    const y_axis = d3.axisLeft(y);
    const y_axisElements = svg.append("g")
        .call(y_axis);
    // y_axisElements.selectAll("text").remove();

    let size = 2

    // create a tooltip
    const tooltip = d3.select("#scatterPlot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("width", "150px")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("font", "3px sans-serif")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    const mouseover = function () {
        tooltip.style("opacity", 1)
    }

    const mousemove = function (e, d) {
        tooltip
            .html("Owner Name: " + d.Owner + "<br>" +
                "Farm: " + d.Farm_Name + "<br>" +
                // "Aroma: " + d.Aroma + "<br>" +
                // "Flavor: " + d.Flavor + "<br>" +
                // "Aftertaste: " + d.Aftertaste + "<br>" +
                // "Acidity: " + d.Acidity + "<br>" +
                // "Body: " + d.Body + "<br>" +
                // "Balance: " + d.Balance + "<br>" +
                "TotalCupPoints: " + d.TotalCupPoints + "<br>" + "")
            .style("left", (e.pageX + 90) + 'px')
            .style("top", e.pageY + 'px')
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const mouseleave = function () {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", (d) => {
            return x(d.TotalCupPoints);
        })
        .attr("cy", (d) => {
            return y(d.altitude_mean_meters);
        })
        .attr("r", (d) => {
            return size;
        })
        .style("fill", (d) => {
            return color(d.Region)
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // Add the legend
    svg.append("circle").attr("cx", 5).attr("cy", 5).attr("r", 2).style("fill", "#440154ff").attr("stroke", "black").attr("stroke-width", 0.5)
    svg.append("circle").attr("cx", 40).attr("cy", 5).attr("r", 2).style("fill", "#21908dff").attr("stroke", "black").attr("stroke-width", 0.5)
    svg.append("circle").attr("cx", 75).attr("cy", 5).attr("r", 2).style("fill", "#fde725ff").attr("stroke", "black").attr("stroke-width", 0.5)
    svg.append("circle").attr("cx", 5).attr("cy", 15).attr("r", 2).style("fill", "#FFC0CB").attr("stroke", "black").attr("stroke-width", 0.5)
    svg.append("circle").attr("cx", 40).attr("cy", 15).attr("r", 2).style("fill", "#0096FF").attr("stroke", "black").attr("stroke-width", 0.5)
    svg.append("circle").attr("cx", 75).attr("cy", 15).attr("r", 2).style("fill", "#EE4B2B").attr("stroke", "black").attr("stroke-width", 0.5)
    svg.append("text").attr("x", 10).attr("y", 5).text("Africa").style("font-size", "7px").attr("alignment-baseline", "middle")
    svg.append("text").attr("x", 45).attr("y", 5).text("Asia").style("font-size", "7px").attr("alignment-baseline", "middle")
    svg.append("text").attr("x", 80).attr("y", 5).text("CentralA").style("font-size", "7px").attr("alignment-baseline", "middle")
    svg.append("text").attr("x", 10).attr("y", 15).text("NorthA").style("font-size", "7px").attr("alignment-baseline", "middle")
    svg.append("text").attr("x", 45).attr("y", 15).text("Pacific").style("font-size", "7px").attr("alignment-baseline", "middle")
    svg.append("text").attr("x", 80).attr("y", 15).text("SouthA").style("font-size", "7px").attr("alignment-baseline", "middle")
}

async function main() {
    const coffeeData = await getCoffeeInfo();
    await drawPlot(coffeeData)
}

main();