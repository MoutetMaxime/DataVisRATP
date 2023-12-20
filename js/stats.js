const ctx = {
    w: 1200,
    h: 800,
};

function createBarChart(svgEl, trafficData) {
    var margin = {top: 150, right: 30, bottom: 120, left: 150},
        width = 400,
        height = 200;

    const xScale = d3.scaleBand()
                     .rangeRound([0, width])
                     .padding(0.1)
                     .domain(trafficData.map(d => d.year));

    const yScale = d3.scaleLinear()
                     .range([height, 0])
                     .domain([0, d3.max(trafficData, d => d.metro + d.rer)]);
    
    const colorScale = d3.scaleOrdinal()
                     .domain(['metro', 'rer'])
                     .range(["#2171b5", "#9ecae1"]);

    const g = svgEl.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
     .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(xScale));

    g.append("g")
    .call(d3.axisLeft(yScale));

    g.selectAll(".bar.metro")
    .data(trafficData)
    .enter().append("rect")
    .attr("class", "bar metro")
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.metro))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(0))
    .transition()
    .duration(750)
    .attr("height", d => height - yScale(d.metro))
    .attr("fill", colorScale('metro'));

   g.selectAll(".bar.rer")
    .data(trafficData)
    .enter().append("rect")
    .attr("class", "bar rer")
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.metro + d.rer))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(0))
    .transition()
    .duration(750)
    .attr("height", d => height - yScale(d.rer))
    .attr("fill", colorScale('rer'));

    var legend = svgEl.append("g")
                      .attr("transform", `translate(${width + margin.left + 40}, ${margin.top})`);

    var legendData = [
        { label: "Métro", color: "#2171b5" },
        { label: "RER", color: "#9ecae1" }
    ];

    legendData.forEach((d, i) => {
        var legendRow = legend.append("g")
                              .attr("transform", `translate(0, ${i * 20})`);

        legendRow.append("rect")
                 .attr("width", 10)
                 .attr("height", 10)
                 .attr("fill", d.color);

        legendRow.append("text")
                 .attr("x", -10)
                 .attr("y", 10)
                 .attr("text-anchor", "end")
                 .style("text-transform", "capitalize")
                 .style("font-size", "12px")
                 .style("fill", "#fff")
                 .text(d.label);
    });

    svgEl.append("text")
     .attr("x", (width / 2) + 125)
     .attr("y", 0.7 * margin.top)
     .attr("text-anchor", "middle")
     .style("font-size", "20px")
     .style("fill", "#fff")
     .text('ANNUAL RATP TRAFFIC');
}

function createHorizontalBarChart(svgEl, data) {
    var barWidth = 300,
        barHeight = 300, 
        barMarginTop = 450;

    const yScale = d3.scaleBand()
                     .rangeRound([0, barHeight])
                     .padding(0.1)
                     .domain(data.map(d => d.Station));

    const xScale = d3.scaleLinear()
                     .range([0, barWidth])
                     .domain([0, d3.max(data, d => d.Trafic)]);

    const gBar = svgEl.append("g").attr("transform", `translate(${200},${barMarginTop})`);

    gBar.append("g")
        .call(d3.axisLeft(yScale));
    
    gBar.append("g")
        .attr("transform", `translate(0, ${barHeight})`)
        .call(d3.axisBottom(xScale).ticks(5));

    var blueColors = ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", 
        "#9ecae1", "#c6dbef", "#deebf7", "#eff3ff", "#f7fbff"];

    var color = d3.scaleOrdinal(blueColors).domain(data.map(d => d.Station));
    

    gBar.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.Station))
        .attr("height", yScale.bandwidth())
        .attr("x", 0)
        .attr("width", d => xScale(0))
        .transition()
        .duration(750)
        .attr("width", d => xScale(d.Trafic))
        .attr("fill", (d, i) => color(i)); 

    svgEl.append("text")
        .attr("x", barWidth)
        .attr("y", barMarginTop - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "#fff")
        .text('TOP 10 BUSIEST RATP STATIONS IN 2022 (NB. OF PASSENGERS)');
}




function loadData(svgEl){
    const fileNames = [
        "2014.csv", "2015.csv", "2016.csv", "2017.csv", "2018.csv", 
        "2019.csv", "2020.csv", "2021.csv", "2022.csv"
    ];

    const filePromises = fileNames.map(fileName =>
        d3.dsv(";", `data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-${fileName}`)
    );

    Promise.all(filePromises).then(files => {
        const trafficData = files.map((data, index) => {
            let yearData = { year: 2014 + index, metro: 0, rer: 0 };
            data.forEach(d => {
                if (d.Réseau === "Métro") {
                    yearData.metro += +d.Trafic;
                } else if (d.Réseau === "RER") {
                    yearData.rer += +d.Trafic;
                }
            });
            return yearData;
        });

        createBarChart(svgEl, trafficData);

        let topStations = files[files.length - 1]
            .sort((a, b) => b.Trafic - a.Trafic)
            .slice(0, 10);

        createHorizontalBarChart(svgEl, topStations);
        
    }).catch(err => {
        console.log("Error loading data", err);
    });
}

function formatTrafic(value) {
    if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M'; // Arrondit à une décimale pour les millions
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1) + 'k'; // Arrondit à une décimale pour les milliers
    } else {
      return value.toString(); // Moins de 1000, affichez le nombre complet
    }
  }

function createMap(svgEl) {
    // Dimensions et échelle pour la carte
    const mapWidth = 800, mapHeight = 800;
    const mapMarginLeft = 700;
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
        
        // Calculer la position du centre de chaque arrondissement pour placer les bulles
        arrondissementsData.features.forEach(function(feature) {
            feature.properties.center = path.centroid(feature);
        });

        d3.dsv(";",'data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2022.csv', function(d) {
            return {
                Arrondissement: +d['Arrondissement pour Paris'],
                Trafic: +d.Trafic
            };
        }).then(function(data) {
            let traficData = Array.from(d3.rollup(data, 
                v => d3.sum(v, d => d.Trafic), 
                d => d.Arrondissement))
                .map(([Arrondissement, Trafic]) => ({ Arrondissement, Trafic }))
                .filter(d => d.Arrondissement !== 0);
            
            const radiusScale = d3.scaleSqrt()
                .domain([0, d3.max(traficData, d => d.Trafic)])
                .range([0, 60]); // Ajuster le rayon max selon la visualisation
                

            gMap.selectAll("circle")
                .data(traficData)
                .enter().append("circle")
                .attr("cx", d => {
                    let arrondissement = arrondissementsData.features.find(feature => +feature.properties.c_ar === d.Arrondissement);
                    return arrondissement ? projection(d3.geoCentroid(arrondissement))[0] : null;
                })
                .attr("cy", d => {
                    let arrondissement = arrondissementsData.features.find(feature => +feature.properties.c_ar === d.Arrondissement);
                    return arrondissement ? projection(d3.geoCentroid(arrondissement))[1] : null;
                })
                .attr("r", d => radiusScale(d.Trafic))
                .attr("fill", "#2171b5")
                .attr("stroke", "#fff")
                .append("title").text(d => d.Arrondissement + 'e Arr');
            
            const textGroup = gMap.append("g").attr("class", "labels");

            textGroup.selectAll("text")
                  .data(traficData)
                  .enter().append("text")
                  .attr("x", d => {
                    let arrondissement = arrondissementsData.features.find(feature => +feature.properties.c_ar === d.Arrondissement);
                    return arrondissement ? projection(d3.geoCentroid(arrondissement))[0] : null;
                  })
                  .attr("y", d => {
                    let arrondissement = arrondissementsData.features.find(feature => +feature.properties.c_ar === d.Arrondissement);
                    return arrondissement ? projection(d3.geoCentroid(arrondissement))[1] : null;
                  })
                  .attr("text-anchor", "middle")
                  .attr("alignment-baseline", "central")
                  .style("fill", "white") // Changé pour le noir pour assurer la visibilité
                  .style("font-size", d => `${radiusScale(d.Trafic)/2}px`) // Exemple de dimensionnement dynamique
                  .text(d => formatTrafic(d.Trafic));
            });
    });

    svgEl.append("text")
        .attr("x", 1000) // Centrez le titre
        .attr("y", 100) // Positionnez le titre en haut (ajustez selon vos besoins)
        .attr("text-anchor", "middle") // Centrez le texte horizontalement
        .style("font-size", "24px") // Taille de la police du titre
        .style("fill", "#fff") // Couleur du texte
        .text("ANNUAL 2022 TRAFFIC IN PARIS ARRONDISSEMENTS"); // Titre en anglais

}

function createViz(){
    console.log("Using D3 v" + d3.version);
    d3.select("body").on("keydown", function(event){ handleKeyEvent(event); });
    const svgEl = d3.select("#main").append("svg")
      .attr("width", ctx.w)
      .attr("height", ctx.h);

    loadData(svgEl);
    createMap(svgEl);
}
