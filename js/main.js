const ctx = {
    w: 800,
    h: 800,
    mapMode: false,
    MIN_COUNT: 3000,
    ANIM_DURATION: 600, // ms
    NODE_SIZE_NL: 2,
    NODE_SIZE_MAP: 3,
    LINK_ALPHA: 0.2,
    nodes: [],
    links: [],
};

const MERCATOR_PROJ = d3.geoMercator().center([2.3514616, 48.8566969]).scale(200000).translate([ctx.w, ctx.h / 2]);
const geoPathGenerator = d3.geoPath().projection(MERCATOR_PROJ);


//Fonction qui créée les stations et les lignes de traffic
function createGraphLayout(svg, station, trafficLines){
    const metroGroup = svg.append("g").attr("class", "metro-stations");
    const rerGroup = svg.append("g").attr("class", "rer-stations");
    const tramGroup = svg.append("g").attr("class", "tram-stations");
    const terGroup = svg.append("g").attr("class", "ter-stations");
    const metroLines = svg.append("g").attr("class", "metro-lines");
    const rerLines = svg.append("g").attr("class", "rer-lines");
    const tramLines = svg.append("g").attr("class", "tram-lines");
    const terLines = svg.append("g").attr("class", "ter-lines");

    createRerStations(rerGroup, station.features.filter(d => d.properties.mode === "RER"), rerLines, trafficLines.features.filter(d => d.properties.mode === "RER"));
    createTramStations(tramGroup, station.features.filter(d => d.properties.mode === "TRAMWAY"), tramLines, trafficLines.features.filter(d => d.properties.mode === "TRAMWAY"));
    createTerStations(terGroup, station.features.filter(d => d.properties.mode === "TRAIN"), terLines, trafficLines.features.filter(d => d.properties.mode === "TRAIN"));
    createMetroStations(metroGroup, station.features.filter(d => d.properties.mode === "METRO"), metroLines, trafficLines.features.filter(d => d.properties.mode === "METRO"));
    console.log(station.features.filter(d => d.properties.mode === "METRO"))
};

//Stations et lignes de métro
function createMetroStations(group, stations, groupLines, metroLines) {
    group.selectAll(".metro-station")
        .data(stations)
        .enter()
        .append("image")
        .attr("xlink:href", "/icone_metro.png")
        .attr("x", function (d) {
           return MERCATOR_PROJ(d.geometry.coordinates)[0]- ctx.NODE_SIZE_NL;
       })
        .attr("y", function (d) {
           return MERCATOR_PROJ(d.geometry.coordinates)[1]- ctx.NODE_SIZE_NL;
       })
        .attr("width", ctx.NODE_SIZE_NL * 4)
        .attr("height", ctx.NODE_SIZE_NL * 4)
        .attr("id", d => d.properties.nom_gares)
        .on("click", function(d) {
            const stationPageURL = "detail_station.html" + "?id=" + this.id;
            window.location.href = stationPageURL;
        })
        .append("title").text(d => d.properties.nom_gares);
    
    drawTrafficLines(groupLines, metroLines, ".metro-lines");
}

//Stations et lignes de RER
function createRerStations(group, stations, groupLines, rerLines) {
    group.selectAll(".rer-station")
        .data(stations)
        .enter()
        .append("image")
        .attr("xlink:href", "/icone_rer.png") 
        .attr("x", function (d) {
            return MERCATOR_PROJ(d.geometry.coordinates)[0] - ctx.NODE_SIZE_NL;
        })
        .attr("y", function (d) {
            return MERCATOR_PROJ(d.geometry.coordinates)[1] - ctx.NODE_SIZE_NL;
        })
        .attr("width", ctx.NODE_SIZE_NL*4)
        .attr("height", ctx.NODE_SIZE_NL*4)
        .style("fill", "red")
        .attr("id", d => d.properties.nom_gares)
        .on("click", function(d) {
            const stationPageURL = "detail_station.html" + "?id=" + this.id;
            window.location.href = stationPageURL;
        })
        .append("title").text(d => d.properties.nom_gares);
    
    drawTrafficLines(groupLines, rerLines, ".rer-lines");

}

//Stations et lignes de Tram
function createTramStations(group, stations, groupLines, tramLines) {
    group.selectAll(".tram-station")
        .data(stations)
        .enter()
        .append("image")
        .attr("xlink:href", "icone_tram.png")
        .attr("x", function (d) {
            return MERCATOR_PROJ(d.geometry.coordinates)[0] - ctx.NODE_SIZE_NL;
        })
        .attr("y", function (d) {
            return MERCATOR_PROJ(d.geometry.coordinates)[1] - ctx.NODE_SIZE_NL;
        })
        .attr("width", ctx.NODE_SIZE_NL * 4)
        .attr("height", ctx.NODE_SIZE_NL * 4)
        .attr("id", d => d.properties.nom_gares)
        .on("click", function(d) {
            const stationPageURL = "detail_station.html" + "?id=" + this.id;
            window.location.href = stationPageURL;
        })
        .append("title").text(d => d.properties.nom_gares);

    drawTrafficLines(groupLines, tramLines, ".tram-lines")
}

//Stations et lignes de TER
function createTerStations(group, stations, groupLines, terLines) {
    group.selectAll(".ter-station")
        .data(stations)
        .enter()
        .append("image")
        .attr("xlink:href", "/icone_TER.png") // Assurez-vous d'avoir une icône pour les TER
        .attr("x", function (d) {
            return MERCATOR_PROJ(d.geometry.coordinates)[0] - ctx.NODE_SIZE_NL;
        })
        .attr("y", function (d) {
            return MERCATOR_PROJ(d.geometry.coordinates)[1] - ctx.NODE_SIZE_NL;
        })
        .attr("width", ctx.NODE_SIZE_NL * 4)
        .attr("height", ctx.NODE_SIZE_NL * 4)
        .attr("id", d => d.properties.nom_gares)
        .on("click", function(d) {
            const stationPageURL = "detail_station.html" + "?id=" + this.id;
            window.location.href = stationPageURL;
        })
        .append("title").text(d => d.properties.nom_gares);

    drawTrafficLines(groupLines, terLines, ".ter-lines")

}

//Lignes de traffic
function drawTrafficLines(group, trafficData, lines) {
    group.selectAll(lines)
       .data(trafficData)
       .enter()
       .append("path")
       .attr("d", geoPathGenerator)
       .style("fill", "none")
       .style("stroke", "#20B2AA")
       .style("stroke-width", 2)
       .style("opacity", 0) // Set initial opacity to 0

       // Add transition for progressive animation
       .transition()
       .duration(1000) // Animation duration in milliseconds
       .delay((d, i) => i * 5) // Delay between each linn
       .style("opacity", 1);

}



//Légende de densité de population
function drawLegend(svg, colorScale) {
    const legendWidth = 20, legendHeight = 300;
    const legendX = 25; 
    const legendY = 150; 

    const numBoxes = colorScale.range().length;
    const boxHeight = legendHeight / numBoxes;

    svg.append("g")
       .attr("class", "legend")
       .attr("transform", `translate(${legendX}, ${legendY})`)
       .selectAll("rect")
       .data(colorScale.range())
       .enter()
       .append("rect")
       .attr("x", 0)
       .attr("y", (d, i) => i * boxHeight)
       .attr("width", legendWidth)
       .attr("height", boxHeight)
       .style("fill", d => d);

    svg.select(".legend")
       .selectAll("text")
       .data(colorScale.quantiles())
       .enter()
       .append("text")
       .attr("x", legendWidth + 5)
       .attr("y", (d, i) => i * boxHeight + boxHeight / 2)
       .text(d => `≤ ${Math.round(d)}`)
       .style("font-size", "10px")
         .style("fill", "white");

    svg.select(".legend")
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .text("Densité de population")
        .style("font-weight", "bold")
        .style("fill", "white");
}

function loadData(svg){
    var map = svg.append("g").attr("id", "map");
    var arrondissement = d3.json("data_ratp/arrondissements.geojson");
    var station = d3.json("data_ratp/emplacement-des-gares-idf.geojson");
    var trafficLines = d3.json("data_ratp/traces-du-reseau-ferre-idf.geojson");
    Promise.all([arrondissement, station, trafficLines]).then(function (data) {
        let arrondissement = data[0];
        let station = data[1];
        let trafficLines = data[2];

        createGraphLayout(svg, station, trafficLines);

        const minDensity = d3.min(arrondissement.features, d => d.properties.density);
        const maxDensity = d3.max(arrondissement.features, d => d.properties.density);

    // Créer une échelle de couleurs avec ces valeurs
        const colorScale = d3.scaleQuantile()
            .domain(arrondissement.features.map(d => d.properties.density))
            .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]);

        map.selectAll("path")
            .data(arrondissement.features)
            .enter()
            .append("path")
            .attr("d", function (d) {
                return geoPathGenerator(d.geometry);
            })
            .attr("class", "state")
            .style("fill", d => colorScale(d.properties.density))
            .style("stroke", "black")
            .style("stroke-width", 2)
            .append("title")
            .text(function(d){return `${d.properties.l_ar}`;})
        
        drawLegend(svg, colorScale);
        drawTrafficLines(svg, trafficLines);
        }).catch(function (err) {
            console.log("Error loading data");
            console.log(err);
        }
        );
}
function showMetro() {
    d3.select(".metro-stations").transition().duration(1000).style("opacity", 1);
    d3.select(".rer-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".tram-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".ter-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".metro-lines").transition().duration(1000).style("opacity", 1);
    d3.select(".rer-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".tram-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".ter-lines").transition().duration(1000).style("opacity", 0);
}

function showRER() {
    d3.select(".metro-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".rer-stations").transition().duration(1000).style("opacity", 1);
    d3.select(".tram-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".ter-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".metro-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".rer-lines").transition().duration(1000).style("opacity", 1);
    d3.select(".tram-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".ter-lines").transition().duration(1000).style("opacity", 0);
}

function showTram() {
    d3.select(".metro-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".rer-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".tram-stations").transition().duration(1000).style("opacity", 1);
    d3.select(".ter-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".metro-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".rer-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".tram-lines").transition().duration(1000).style("opacity", 1);
    d3.select(".ter-lines").transition().duration(1000).style("opacity", 0);
}

function showTer() {
    d3.select(".ter-stations").transition().duration(1000).style("opacity", 1);
    d3.select(".metro-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".rer-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".tram-stations").transition().duration(1000).style("opacity", 0);
    d3.select(".metro-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".rer-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".tram-lines").transition().duration(1000).style("opacity", 0);
    d3.select(".ter-lines").transition().duration(1000).style("opacity", 1);
}

function showAll() {
    d3.select(".ter-stations").transition().duration(1000).style("opacity", 1);
    d3.select(".metro-stations").transition().duration(1000).style("opacity", 1);
    d3.select(".rer-stations").transition().duration(1000).style("opacity", 1);
    d3.select(".tram-stations").transition().duration(1000).style("opacity", 1);
    d3.select(".metro-lines").transition().duration(1000).style("opacity", 1);
    d3.select(".rer-lines").transition().duration(1000).style("opacity", 1);
    d3.select(".tram-lines").transition().duration(1000).style("opacity", 1);
    d3.select(".ter-lines").transition().duration(1000).style("opacity", 1);
}

function createViz() {
    console.log("Using D3 v" + d3.version);

    // Set up key event listener
    d3.select("body").on("keydown", function (event, d) {
        handleKeyEvent(event);
    });

    // Create SVG element
    let svgEl = d3.select("#main").append("svg")
        .attr("width", ctx.w)
        .attr("height", ctx.h);

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8]) // Define the minimum and maximum zoom levels
        .on("zoom", zoomed);

    svgEl.call(zoom);

    loadData(svgEl);

    // Set up event listeners for different actions
    d3.select("#showMetro").on("click", showMetro);
    d3.select("#showRER").on("click", showRER);
    d3.select("#showTram").on("click", showTram);
    d3.select("#showTer").on("click", showTer);
    d3.select("#showAll").on("click", showAll);

    function zoomed(event) {
        const { x, y, k } = event.transform;
        svgEl.attr("transform", `scale(${k})`);
    }
}