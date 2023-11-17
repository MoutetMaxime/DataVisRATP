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

const MERCATOR_PROJ = d3.geoMercator().center([2.3722, 48.9066]).scale(150000);
const geoPathGenerator = d3.geoPath().projection(MERCATOR_PROJ);

function createGraphLayout(svg, station){
    // Créer des groupes pour chaque type de station
    const metroGroup = svg.append("g").attr("class", "metro-stations");
    const rerGroup = svg.append("g").attr("class", "rer-stations");
    const tramGroup = svg.append("g").attr("class", "tram-stations");

    // Appel de fonctions spécifiques pour chaque type
    createMetroStations(metroGroup, station.features.filter(d => d.properties.mode === "METRO"));
    createRerStations(rerGroup, station.features.filter(d => d.properties.mode === "RER"));
    createTramStations(tramGroup, station.features.filter(d => d.properties.mode === "TRAMWAY"));
    //y a aussi des TRAINS jsp si vous voulez les afficher 

};

function createMetroStations(group, stations) {
    group.selectAll(".metro-station")
        .data(stations)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
           return MERCATOR_PROJ(d.geometry.coordinates)[0];
       })
        .attr("cy", function (d) {
           return MERCATOR_PROJ(d.geometry.coordinates)[1];
       })
        .attr("r", ctx.NODE_SIZE_NL)
        .style("fill", "orange")
        .append("title").text(d => d.properties.nom_gares);
}

function createRerStations(group, stations) {
    group.selectAll(".rer-station")
        .data(stations)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return MERCATOR_PROJ(d.geometry.coordinates)[0] - ctx.NODE_SIZE_NL / 2;
        })
        .attr("y", function (d) {
            return MERCATOR_PROJ(d.geometry.coordinates)[1] - ctx.NODE_SIZE_NL / 2;
        })
        .attr("width", ctx.NODE_SIZE_NL*2)
        .attr("height", ctx.NODE_SIZE_NL*2)
        .style("fill", "red")
        .append("title").text(d => d.properties.nom_gares);
}

function createTramStations(group, stations) {
    group.selectAll(".tram-station")
        .data(stations)
        .enter()
        .append("path")
        .attr("d", function (d) {
            // Calculer les coordonnées du centre de la station
            var center = MERCATOR_PROJ(d.geometry.coordinates);
            var x = center[0];
            var y = center[1];
            var size = ctx.NODE_SIZE_NL*1.3; // Taille du triangle
   
            // Définir les points du triangle
            return `M ${x} ${y - size} L ${x - size} ${y + size} L ${x + size} ${y + size} Z`;
        })
        .style("fill", "yellow")
        .append("title").text(d => d.properties.nom_gares);
}

function drawLegend(svg, colorScale) {
    // Taille et position de la légende
    const legendWidth = 20, legendHeight = 300;
    const legendX = ctx.w - legendWidth - 50; 
    const legendY = 50; 

    // Créer des rectangles pour la légende
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

    // Ajouter du texte à la légende
    svg.select(".legend")
       .selectAll("text")
       .data(colorScale.quantiles())
       .enter()
       .append("text")
       .attr("x", legendWidth + 5)
       .attr("y", (d, i) => i * boxHeight + boxHeight / 2)
       .text(d => `≤ ${Math.round(d)}`)
       .style("font-size", "10px");

    // Ajouter un titre à la légende
    svg.select(".legend")
       .append("text")
       .attr("x", 0)
       .attr("y", -10)
       .text("Densité")
       .style("font-weight", "bold");
}

function drawStationLegend(svg) {
    const legendX = 50; 
    const legendY = ctx.h - 100; 
    const spacing = 30; // Espacement entre les lignes de légende

    // Groupe pour la légende des stations
    const stationLegend = svg.append("g")
                             .attr("class", "station-legend")
                             .attr("transform", `translate(${legendX}, ${legendY})`);

    // Légende pour le métro
    stationLegend.append("circle")
                 .attr("cx", 0)
                 .attr("cy", 0)
                 .attr("r", ctx.NODE_SIZE_NL)
                 .style("fill", "orange");
    stationLegend.append("text")
                 .attr("x", 20)
                 .attr("y", 5)
                 .text("Métro")
                 .style("font-size", "12px");

    // Légende pour le RER
    stationLegend.append("rect")
                 .attr("x", 0)
                 .attr("y", spacing)
                 .attr("width", ctx.NODE_SIZE_NL*2)
                 .attr("height", ctx.NODE_SIZE_NL*2)
                 .style("fill", "red");
    stationLegend.append("text")
                 .attr("x", 20)
                 .attr("y", spacing + 5)
                 .text("RER")
                 .style("font-size", "12px");

    const triangleSize = ctx.NODE_SIZE_NL*3; // Utiliser la même base de taille que pour les autres symboles
    const triangleHeight = Math.sqrt(3) / 2 * triangleSize; // Hauteur d'un triangle équilatéral
             
    // Légende pour le Tramway
    stationLegend.append("path")
        .attr("d", `M 0 ${spacing * 2} L ${-triangleSize / 2} ${spacing * 2 + triangleHeight} L ${triangleSize / 2} ${spacing * 2 + triangleHeight} Z`)
        .style("fill", "yellow");
    stationLegend.append("text")
        .attr("x", 20)
        .attr("y", spacing * 2 + 5)
        .text("Tramway")
        .style("font-size", "12px");
}


function loadData(svg){
    var map = svg.append("g").attr("id", "map");
    var arrondissement = d3.json("data_ratp/arrondissements.geojson");
    var station = d3.json("data_ratp/emplacement-des-gares-idf.geojson");
    Promise.all([arrondissement, station]).then(function (data) {
        let arrondissement = data[0];
        let station = data[1];

        const minDensity = d3.min(arrondissement.features, d => d.properties.density);
        const maxDensity = d3.max(arrondissement.features, d => d.properties.density);

    // Créer une échelle de couleurs avec ces valeurs
        const colorScale = d3.scaleQuantile()
            .domain(arrondissement.features.map(d => d.properties.density))
            .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]);
        drawLegend(svg, colorScale);


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
            .append("title")
            .text(function(d){return `${d.properties.l_ar}`;})
        
        createGraphLayout(svg, station);
        }).catch(function (err) {
            console.log("Error loading data");
            console.log(err);
        }
        );
}

function createViz(){
    console.log("Using D3 v"+d3.version);
    d3.select("body")
      .on("keydown", function(event, d){handleKeyEvent(event);});
    let svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    loadData(svgEl);
    drawStationLegend(svgEl);
};