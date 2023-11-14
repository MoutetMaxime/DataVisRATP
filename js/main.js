const ctx = {
    w: 800,
    h: 800,
    mapMode: false,
    MIN_COUNT: 3000,
    ANIM_DURATION: 600, // ms
    NODE_SIZE_NL: 5,
    NODE_SIZE_MAP: 3,
    LINK_ALPHA: 0.2,
    nodes: [],
    links: [],
};

const MERCATOR_PROJ = d3.geoMercator().center([2.3722, 48.9066]).scale(150000);
const geoPathGenerator = d3.geoPath().projection(MERCATOR_PROJ);

function createGraphLayout(svg, station){
    // J'ai essayé d'ajouter les stations de métro ça marche pas encore bien je sais pas pourquoi
    var circles = svg.append("g").attr("id", "metro station");
    console.log(station);
    circles.selectAll("circle")
            .data(station.features)
            .enter()
            .append("circle")
            .attr("d", function (d) {
                return geoPathGenerator(d.geometry);
            })
            .attr("r", ctx.NODE_SIZE_NL)
            .append("title")
            .text(function(d){return `${d.properties.nom_statio}`;})
}

function loadData(svg){
    var map = svg.append("g").attr("id", "map")
                    .style("opacity", 0.5);
    var arrondissement = d3.json("data_ratp/arrondissements.geojson");
    var station = d3.json("data_ratp/stations-metro.geojson");
    Promise.all([arrondissement, station]).then(function (data) {
        let arrondissement = data[0];
        let station = data[1];

        map.selectAll("path")
            .data(arrondissement.features)
            .enter()
            .append("path")
            .attr("d", function (d) {
                return geoPathGenerator(d.geometry);
            })
            .attr("class", "state")
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
};