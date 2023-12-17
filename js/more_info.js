const ctx = {
    w: 1200,
    h: 800,
};


function createMap(svgEl) {
    // Dimensions et échelle pour la carte
    const mapWidth = 1200, mapHeight = 800;
    const mapMarginLeft = 200;
    const defibrillatorIconPath = '/defibrillator.png'; // Mettez à jour avec le chemin réel vers votre icône
    const defibrillatorIconSize = [20, 20]; // La largeur et la hauteur de l'icône en pixels
    const gMap = svgEl.append("g")
                      .attr("transform", `translate(${mapMarginLeft}, 0)`);

    // Projection pour la carte de Paris
    const projection = d3.geoMercator()
                         .center([2.3522, 48.8566]) // Coordonnées de Paris
                         .scale(200000) // Ajuster selon la taille souhaitée
                         .translate([mapWidth / 2, mapHeight / 2]);

    // Path generator
    const path = d3.geoPath().projection(projection);

    // Chargement des données GeoJSON des arrondissements
    d3.json('data_ratp//arrondissements.geojson').then(arrondissementsData => {
        gMap.selectAll("path")
            .data(arrondissementsData.features)
            .enter().append("path")
            .attr("fill", "#ccc")
            .attr("d", path)
            .attr("stroke", "#fff");

        // Chargement des données des défibrillateurs
        d3.json('data_ratp/defibrillateurs-du-reseau-ratp.geojson').then(defibrillateursData => {
            gMap.selectAll("image")
                .data(defibrillateursData.features)
                .enter().append("image")
                .attr("xlink:href", defibrillatorIconPath)
                .attr("width", defibrillatorIconSize[0])
                .attr("height", defibrillatorIconSize[1])
                .attr("x", d => projection(d.geometry.coordinates)[0] - defibrillatorIconSize[0] / 2) // Centrer l'icône sur la coordonnée
                .attr("y", d => projection(d.geometry.coordinates)[1] - defibrillatorIconSize[1] / 2); // Centrer l'icône sur la coordonnée
        });
    });
}

function createViz(){
    console.log("Using D3 v" + d3.version);
    d3.select("body").on("keydown", function(event){ handleKeyEvent(event); });
    const svgEl = d3.select("#main").append("svg")
      .attr("width", ctx.w)
      .attr("height", ctx.h);

    createMap(svgEl);
}