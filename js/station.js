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


function graphTraffic(svgEl, data){
    var minTraffic = d3.min(data, d => d.traffic);
    var maxTraffic = d3.max(data, d => d.traffic);

    var x = d3.scaleTime().domain([new Date(2014, 0, 1), new Date(2022, 0, 1)]).range([0, 400]);
    var y = d3.scaleLinear().range([200, 0]).domain([minTraffic, maxTraffic]);

    svgEl.append("g")
        .attr("transform", "translate(100, 250)")
        .call(d3.axisBottom(x));

    svgEl.append("g")
        .attr("transform", "translate(100, 50)")
        .call(d3.axisLeft(y));

        svgEl.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .style("fill", "steelblue")
        .attr("x", function(d) { return x(new Date(d.year)); })
        .attr("width", 20)
        .attr("y", function(d) { return y(d.traffic); })
        .attr("height", function(d) { return 200 - y(d.traffic); });
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
