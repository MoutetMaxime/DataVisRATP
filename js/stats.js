const ctx = {
    w: 1200,
    h: 800,
};

function createBarChart(svgEl, trafficData) {
    var margin = {top: 100, right: 30, bottom: 70, left: 150},
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

   // Ajout des barres pour RER, empilées sur les barres METRO
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

    // Position de la légende
    var legend = svgEl.append("g")
                      .attr("transform", `translate(${width + margin.left + 40}, ${margin.top})`);

    // Couleurs et labels pour la légende
    var legendData = [
        { label: "Métro", color: "#2171b5" },
        { label: "RER", color: "#9ecae1" }
    ];

    // Créer les éléments de la légende
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
     .text('ANNUAL RATP TRAFIC');
}

function createHorizontalBarChart(svgEl, data) {
    var barWidth = 300,
        barHeight = 300, // Hauteur augmentée pour accueillir les barres horizontales
        barMarginTop = 450;

    // Échelle pour l'axe Y qui représente les stations
    const yScale = d3.scaleBand()
                     .rangeRound([0, barHeight])
                     .padding(0.1)
                     .domain(data.map(d => d.Station));

    // Échelle pour l'axe X qui représente le trafic
    const xScale = d3.scaleLinear()
                     .range([0, barWidth])
                     .domain([0, d3.max(data, d => d.Trafic)]);

    // Groupe pour le graphique à barres horizontales
    const gBar = svgEl.append("g").attr("transform", `translate(${200},${barMarginTop})`);

    // Ajouter les axes
    gBar.append("g")
        .call(d3.axisLeft(yScale));
    
    gBar.append("g")
        .attr("transform", `translate(0, ${barHeight})`)
        .call(d3.axisBottom(xScale).ticks(5));

    var blueColors = ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", 
        "#9ecae1", "#c6dbef", "#deebf7", "#eff3ff", "#f7fbff"];

    var color = d3.scaleOrdinal(blueColors).domain(data.map(d => d.Station));
    

    // Créer les barres horizontales
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

    // Ajouter le titre
    svgEl.append("text")
        .attr("x", barWidth)
        .attr("y", barMarginTop - 50)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "#fff")
        .text('TOP 10 BUSIEST RATP STATIONS IN 2022');
}




function loadTopStationsData(svgEl){
    d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2022.csv", function(d) {
        return { Station: d.Station, Trafic: +d.Trafic };
    }).then(function(data) {
        // Trier et prendre les 10 premières stations
        var topStations = data.sort((a, b) => b.Trafic - a.Trafic).slice(0, 10);
        createHorizontalBarChart(svgEl, topStations);
    }).catch(function (err) {
        console.warn("Error loading data", err);
    });
}




function loadData(svgEl){
    Promise.all([
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2014.csv"),
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2015.csv"),
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2016.csv"),
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2017.csv"),
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2018.csv"),
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2019.csv"),
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2020.csv"),
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2021.csv"),
        d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2022.csv")
      ]).then(function(files) {
        let trafficData = files.map((data, index) => {
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
        
    }).catch(function (err) {
        console.log("Error loading data");
        console.log(err);
    }
    );
}

function createViz(){
    console.log("Using D3 v" + d3.version);
    d3.select("body")
      .on("keydown", function(event, d){handleKeyEvent(event);});
    const svgEl = d3.select("#main").append("svg")
      .attr("width", ctx.w)
      .attr("height", ctx.h)
    loadData(svgEl);
    loadTopStationsData(svgEl);
}
