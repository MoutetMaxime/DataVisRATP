const ctx = {
    w: 1200,
    h: 800,
};


function createMap(svgEl, dataType) {
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
            .attr("fill", "#c6dbef")
            .attr("d", path)
            .attr("stroke", "#fff");

        svgEl.selectAll("image").remove();
        const dataUrl = dataType === 'defibrillateurs' 
            ? 'data_ratp/defibrillateurs-du-reseau-ratp.geojson' 
            : 'data_ratp/sanitaires-reseau-ratp.geojson';
        const iconPaths = {
                defibrillateurs: '/defibrillator.png', // Chemin de l'icône de défibrillateur
                toilettes: '/sanitaires.png'               // Chemin de l'icône de toilettes
            };

        // Chargement des données des défibrillateurs
        const iconPath = iconPaths[dataType];
        const iconSize = [20, 20]; // Vous pouvez également définir des tailles différentes pour chaque type si nécessaire

        // Chargement des données et création des éléments sur la carte
        d3.json(dataUrl).then(data => {
            gMap.selectAll("image")
                .data(data.features)
                .enter().append("image")
                .attr("xlink:href", iconPath)
                .attr("width", iconSize[0])
                .attr("height", iconSize[1])
                .attr("x", d => projection(d.geometry.coordinates)[0] - iconSize[0] / 2)
                .attr("y", d => projection(d.geometry.coordinates)[1] - iconSize[1] / 2)
                .append("title") // Ajout du titre
                .text(d => d.properties.station || d.properties.adr_voie);
        });
    });
}

function loadBaseMap(svgEl) {
    const mapWidth = 1200, mapHeight = 800;
    const mapMarginLeft = 200;
    const gMap = svgEl.append("g")
                      .attr("transform", `translate(${mapMarginLeft}, 0)`);

    const projection = d3.geoMercator()
                         .center([2.3522, 48.8566]) // Coordonnées de Paris
                         .scale(200000)
                         .translate([mapWidth / 2, mapHeight / 2]);

    const path = d3.geoPath().projection(projection);

    d3.json('data_ratp/arrondissements.geojson').then(arrondissementsData => {
        gMap.selectAll("path")
            .data(arrondissementsData.features)
            .enter().append("path")
            .attr("fill", "#c6dbef")
            .attr("d", path)
            .attr("stroke", "#fff");
    });
}

function createViz(){
    console.log("Using D3 v" + d3.version);
    d3.select("body").on("keydown", function(event){ handleKeyEvent(event); });
    const svgEl = d3.select("#main").append("svg")
      .attr("width", ctx.w)
      .attr("height", ctx.h);
    loadBaseMap(svgEl);
    document.querySelectorAll('input[name="mapOption"]').forEach((input) => {
        input.addEventListener('change', function() {
            const selectedOption = this.value;
            createMap(svgEl, selectedOption);
        });
    });
}