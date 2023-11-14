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

function loadData(svg){
    var map = svg.append("g").attr("id", "map")
                    .style("opacity", 0.5);
    let geoPathGenerator = d3.geoPath().projection(MERCATOR_PROJ);
    var states = d3.json("data_ratp/arrondissements.geojson");
    Promise.all([states]).then(function (data) {
        let states = data[0];
        console.log(states.features);
        map.selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("d", function (d) {
                console.log(d.geometry); // Vérifiez les coordonnées géométriques dans la console
                return geoPathGenerator(d.geometry);
            })
            .attr("class", "state");

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