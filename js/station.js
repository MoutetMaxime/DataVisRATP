const ctx = {
    w: 1200,
    h: 800,
};

const files = [
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2014.csv",
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2015.csv",
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2016.csv",
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2017.csv",
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2018.csv",
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2019.csv",
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2020.csv",
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2021.csv",
    "data_ratp/trafic-annuel-entrant-par-station-du-reseau-ferre-2022.csv"
  ];


  function graphTraffic(svgEl, data) {
    var margin = {top: 100, right: 20, bottom: 70, left: 100},
        width = 400,
        height = 200;

    var minTraffic = d3.min(data, d => d.traffic);
    var maxTraffic = d3.max(data, d => d.traffic);

    var x = d3.scaleTime()
              .domain([new Date(2013, 0, 1), new Date(2023, 0, 1)])
              .range([0, width]);
    var y = d3.scaleLinear()
              .domain([0, maxTraffic])
              .range([height, 0]);

    svgEl.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(d3.axisBottom(x));

    svgEl.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(y));

    var barWidth = 30;

    svgEl.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .style("fill", "steelblue")
        .attr("x", function(d) {
            return x(new Date(d.year)) - (barWidth / 2) + margin.left;
        })
        .attr("width", barWidth - 1)
        .attr("y", function(d) { return y(0) + margin.top; })
        .attr("height", 0)
        .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.traffic) + margin.top; })
        .attr("height", function(d) { return height - y(d.traffic); });

    svgEl.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", margin.top / 1.3)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "steelblue")
        .text("ANNUAL TRAFIC FOR THE STATION " + data[0].station);
}


function loadAndFilterCsv(file, stationName) {
    return d3.dsv(";", file, function(d) {
      return { year: new Date(file.match(/\d+/)[0], 0, 1), station: d.Station, traffic: +d.Trafic };
    }).then(data => data.filter(d => d.station === stationName));
  }

function loadData(svgEl){
    const searchParams = new URLSearchParams(window.location.search);
    const stationName = convertirEnMajusculesSansAccents(searchParams.get('id'));
    
    Promise.all(files.map(file => loadAndFilterCsv(file, stationName))).then(function(values) {
        let combinedData = values.flat();

        graphTraffic(svgEl, combinedData);
        
    }).catch(function (err) {
        console.log("Error loading data");
        console.log(err);
    }
    );
}


function convertirEnMajusculesSansAccents(chaine) {
    // Convertir en majuscules
    let chaineEnMajuscules = chaine.toUpperCase();

    // Remplacer les caractères accentués
    chaineEnMajuscules = chaineEnMajuscules
        .replace(/[ÀÁÂÃÄÅ]/g, 'A')
        .replace(/[ÈÉÊË]/g, 'E')
        .replace(/[ÌÍÎÏ]/g, 'I')
        .replace(/[ÒÓÔÕÖ]/g, 'O')
        .replace(/[ÙÚÛÜ]/g, 'U')
        .replace(/[Ç]/g, 'C')
        .replace(/[Ñ]/g, 'N');

    return chaineEnMajuscules;
}

function createViz(){
    console.log("Using D3 v" + d3.version);
    d3.select("body")
      .on("keydown", function(event, d){handleKeyEvent(event);});
    let svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    loadData(svgEl);
}
