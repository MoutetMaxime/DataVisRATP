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
                     .domain([0, d3.max(trafficData, d => d.traffic)]);

    const g = svgEl.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
     .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(xScale));

    g.append("g")
     .call(d3.axisLeft(yScale).tickFormat(d => `${d} passagers`));

    g.selectAll(".bar")
     .data(trafficData)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => xScale(d.year))
     .attr("width", xScale.bandwidth())
     .attr("y", d => yScale(0))
     .attr("height", 0)
     .transition()
     .duration(750)
     .attr("y", d => yScale(d.traffic))
     .attr("height", d => height - yScale(d.traffic))
     .attr("fill", "steelblue");

    svgEl.append("text")
     .attr("x", (width / 2) + margin.left)
     .attr("y", 0.7 * margin.top)
     .attr("text-anchor", "middle")
     .style("font-size", "20px")
     .style("fill", "steelblue")
     .text('ANNUAL RATP TRAFIC');
}

function createPieChart(svgEl, data) {
    var pieWidth = 300,
        pieHeight = 300,
        pieMarginTop = 400; // Ajustez cette valeur pour positionner le camembert en dessous du graphique en barres
    
    var radius = Math.min(pieWidth, pieHeight) / 2;
    var gPie = svgEl.append("g").attr("transform", `translate(${pieWidth / 2 + 175},${pieMarginTop + radius})`);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var pie = d3.pie()
                .sort(null)
                .value(function(d) { return d.Trafic; });

    var path = d3.arc()
                 .outerRadius(radius - 10)
                 .innerRadius(0);

    var label = d3.arc()
                  .outerRadius(radius - 40)
                  .innerRadius(radius - 40);

    var arc = gPie.selectAll(".arc")
               .data(pie(data))
               .enter().append("g")
               .attr("class", "arc");

    arc.append("path")
       .attr("d", path)
       .attr("fill", function(d) { return color(d.data.Station); });

    arc.append("text")
       .attr("transform", function(d) { return `translate(${label.centroid(d)})`; })
       .attr("dy", "0.35em")
       .text(function(d) { return d.data.Station; });
}

function loadTopStationsData(svgEl){
    d3.dsv(";", "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2022.csv", function(d) {
        return { Station: d.Station, Trafic: +d.Trafic };
    }).then(function(data) {
        // Sort and take the top 10 stations
        var topStations = data.sort((a, b) => b.Trafic - a.Trafic).slice(0, 10);
        createPieChart(svgEl, topStations);
    }).catch(function (err) {
        console.log("Error loading data");
        console.log(err);
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
        let trafficData = [];
        files.forEach((data, index) => {
        let year = 2014 + index; 
        let totalTraffic = d3.sum(data, d => +d.Trafic);
        trafficData.push({ year: year, traffic: totalTraffic });
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
