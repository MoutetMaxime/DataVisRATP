const ctx = {
    w: 1200,
    h: 800,
};

const files = [
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2014.csv",
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2015.csv",
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2016.csv",
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2017.csv",
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2018.csv",
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2019.csv",
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2020.csv",
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2021.csv",
    "data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2022.csv"
  ];

const searchParams = new URLSearchParams(window.location.search);
let stationName = convertirEnMajusculesSansAccents(searchParams.get('id'));
if (searchParams.get('id') === "Palais Royal - Musée du Louvre"){
    stationName = 'PALAIS-ROYAL';
}
if (searchParams.get('id') === "Louvre-Rivoli"){
    stationName = 'LOUVRE';
}
if (searchParams.get('id') === "Nation" && searchParams.get('mode')=='RER'){
    stationName = 'NATION-RER';
}
if (searchParams.get('id') === "Châtelet-Les Halles" && searchParams.get('mode')=='RER'){
    stationName = 'CHATELET-LES HALLES-RER';
}
if (searchParams.get('id') === "Gare du Nord" && searchParams.get('mode')=='RER'){
    stationName = 'GARE DU NORD-RER';
}
if (searchParams.get('id') === "La Défense" && searchParams.get('mode')=='RER'){
    stationName = 'LA DEFENSE-RER';
}
if (searchParams.get('id') === "Denfert-Rochereau" && searchParams.get('mode')=='RER'){
    stationName = 'DENFERT-ROCHEREAU-RER';
}
if (searchParams.get('id') === "Gare de Lyon" && searchParams.get('mode')=='RER'){
    stationName = 'GARE DE LYON-RER';
}
if (searchParams.get('id') === "Charles De Gaulle-Étoile" && searchParams.get('mode')=='RER'){
    stationName = 'CHARLES DE GAULLE-ETOILE-RER';
}
const stationType = searchParams.get('mode');


  function graphTraffic(svgEl, data) {
    var margin = {top: 150, right: 30, bottom: 70, left: 150},
        width = 400,
        height = 200;

    var maxTraffic = d3.max(data, d => d.traffic);

    var x = d3.scaleBand()
          .domain(data.map(d => d.year.getFullYear()))
          .rangeRound([0, width])
          .padding(0.1);

    var y = d3.scaleLinear()
              .domain([0, maxTraffic])
              .range([height, 0]);

    const g = svgEl.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
          
    g.append("g")
        .call(d3.axisLeft(y));

    svgEl.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .style("fill", "steelblue")
        .attr("x", d => x(d.year.getFullYear()))
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(0)})
        .attr("height", 0)
        .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.traffic)})
        .attr("height", function(d) { return height - y(d.traffic); })

    svgEl.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", 0.9 * margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "#fff")
        .text('ANNUAL TRAFFIC FOR THE STATION "' + data[0].station + '"')
}


function loadAndFilterCsv(file, stationName, stationType) {
    return d3.dsv(";", file, function(d) {
        return { 
            year: new Date(file.match(/\d+/)[0], 0, 1), 
            station: d.Station, 
            traffic: +d.Trafic,
            type: d.Réseau
        };
    }).then(data => {
        const filteredData = data.filter(d => d.station === stationName && d.type === stationType);
        return filteredData;
    });
}

let stationCorrespondences = {};

function loadCorrespondences(file) {
    d3.dsv(";", file, function(d) {
        return { 
            station: d.Station,
            correspondences: [d.Correspondance_1, d.Correspondance_2, d.Correspondance_3, d.Correspondance_4, d.Correspondance_5].filter(c => c)
        };
    }).then(data => {
        data.forEach(d => {
            stationCorrespondences[d.station] = d.correspondences;
        });
        console.log("Correspondences loaded:", stationCorrespondences);
    }).catch(function (err) {
        console.log("Error loading correspondences");
        console.log(err);
    });
}

loadCorrespondences("data_ratp/trafic/trafic-annuel-entrant-par-station-du-reseau-ferre-2022.csv");

function loadData(svgEl){
    Promise.all(files.map(file => loadAndFilterCsv(file, stationName, stationType))).then(function(values) {
        let combinedData = values.flat();
        if (combinedData.length != 0) {
            const loadedData = combinedData.map(d => ({
                year: d.year.getFullYear(),
                station: d.station,
                traffic: d.traffic,
                correspondences: stationCorrespondences[d.station] || [] // Utilisez les correspondances chargées ou un tableau vide si non trouvées
            }));
            displayStationsWithIcons(svgEl, loadedData);
            graphTraffic(svgEl, combinedData);
        }
    }).catch(function (err) {
        console.log("Error loading data");
        console.log(err);
    });
}


function convertirEnMajusculesSansAccents(chaine) {
    // Convertir en majuscules
    let chaineEnMajuscules = chaine.toUpperCase();

    // Remplace les caractères accentués
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

function displayStationsWithIcons(svgEl, data) {
    svgEl.selectAll('.station-icon').remove();
    const iconSize = 50; // La taille des icônes
    const iconSpacing = 60; // L'espacement entre les icônes
    
    data.forEach((stationData) => {
        stationData.correspondences.forEach((correspondence, corrIndex) => {
            const xPosition = corrIndex * iconSpacing; // Position horizontale de l'icône
            const yPosition = iconSpacing; // Position verticale de l'icône

            // Ajouter un groupe pour chaque icône
            const iconGroup = svgEl.append("g")
                                   .attr("class", "station-icon")
                                   .attr("transform", `translate(${xPosition}, ${yPosition})`);

            // Ajouter une image SVG pour l'icône de la ligne
            iconGroup.append("image")
                     .attr("xlink:href", `/LINES/LINE_${correspondence}.png`) // Utilisez le bon chemin d'accès à votre image
                     .attr("width", iconSize)
                     .attr("height", iconSize)
                     .attr("x", 700)
                     .attr("y", 40);
        });
    });
}




function createViz(){
    console.log("Using D3 v" + d3.version);
    d3.select("body")
      .on("keydown", function(event, d){handleKeyEvent(event);});
    let svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);

    svgEl.append("text")
        .attr("x", ctx.w / 1.5)
        .attr("y", ctx.h / 10)
        .attr("text-anchor", "middle")
        .style("font-size", "60px")
        .style("fill", "steelblue")
        .text(stationName + "-" + convertirEnMajusculesSansAccents(stationType));

    loadData(svgEl);

}
