//load coffee info
async function getCoffeeInfo(year) {
    const coffeeData = await d3.csv("../data/beanData.csv");
    return coffeeData.filter((data) => {
        return data.Grading_Year === year;
    });

}

async function getCountryToChampsSizeAndMvp(coffeeData) {
    const countryToSize = {};
    coffeeData.forEach((data) => {
        if (data.Country_of_Origin in countryToSize) {
            countryToSize[data.Country_of_Origin]["size"] += 1;
            countryToSize[data.Country_of_Origin]["owners"].push(data.Owner);
        } else {
            countryToSize[data.Country_of_Origin] = {"size": 0, "owners": [data.Owner]};
        }
    });
    Object.entries(countryToSize).forEach(([key, value]) => {
            value["mvp"] = getHighestOccurrenceElement(value["owners"]);
        }
    )
    return countryToSize;
}

function getHighestOccurrenceElement(array) {
    if (array.length === 0) {
        return null;
    }
    const modeMap = {};
    let maxEl = array[0], maxCount = 1;
    for (let i = 0; i < array.length; i++) {
        const el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

//load world info
async function getWorldMapData() {
    return d3.json("../data/worldMap.geojson");
}

async function drawWorldMap(worldMapData, countrySize) {
    // The svg
    const svg = d3.select("#worldMap")
        .append("svg")
        .attr("width", 500)
        .attr("height", 380)


    // const svg = d3.select("#worldMap"),
    const width = +svg.attr("width"),
        height = +svg.attr("height");

    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([width / 2, height / 2]);

    // Data and color scale
    const colorScale = d3.scaleThreshold()
        .domain([0, 5, 10, 15, 20, 25, 30, 35, 40])
        .range(d3.schemeBlues[9]);

    const tooltip = d3.select("#worldMap")
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

    const mouseover = function () {
        tooltip.style("opacity", 1)
    }

    const mousemove = function (e, d) {
        if (countrySize[d.properties.name]) {
            tooltip
                .html("Country: " + d.properties.name + "<br>" +
                    "Owner with most rewards: " + countrySize[d.properties.name].mvp + "<br>" + "")
                .style("left", (e.pageX + 90) + 'px')
                .style("top", e.pageY + 'px')
        }
    }

    const mouseleave = function () {
        tooltip
            .transition()
            .duration(500)
            .style("opacity", 0)
    }


    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(worldMapData.features)
        .join("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            if (d.properties.name in countrySize) {
                d.total = countrySize[d.properties.name].size;
                return colorScale(d.total);
            } else {
                return '#F5F5F5';
            }
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


}

$('#coffeeYear').change(function () {
    main($(this).val());
});


async function main(year = '2010') {
    $("#worldMap").empty();
    const coffeeData = await getCoffeeInfo(year);
    const countrySize = await getCountryToChampsSizeAndMvp(coffeeData);
    const worldMapData = await getWorldMapData();
    await this.drawWorldMap(worldMapData, countrySize);
}

main();