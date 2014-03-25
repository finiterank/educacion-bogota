var width = 700,
    height = 900;

var projection = d3.geo.mercator()
    .scale(135000)
    .translate([width / 2, height / 2])
    .center([-74.11991,4.649404])

var path = d3.geo.path()
    .projection(projection);

var mapa = d3.select("#mapa").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("unidades/unidades.json", function(error, bogota) {

var unidades = topojson.feature(bogota, bogota.objects.zonasurbanas),
     vecinos = topojson.neighbors(bogota.objects.zonasurbanas.geometries);

  unidades.features.forEach(function(unidad, i) {
    unidad.centroid = path.centroid(unidad);
    if (unidad.centroid.some(isNaN)) unidad.centroid = null; // off the map
    unidad.neighbors = unidad.centroid ? vecinos[i]
        .filter(function(j) { return j < i && unidades.features[j].centroid; })
        .map(function(j) { return unidades.features[j]; }) : [];
  });


  mapa.append("path")
      .attr("class", "unidad")
      .datum(unidades)
      .attr("d", path);


  mapa.append("path")
    .attr("class", "unidad-borde")
    .datum(topojson.mesh(bogota, bogota.objects.zonasurbanas, function(a, b) { return a !== b; }))
    .attr("d", path);

  mapa.append("path")
      .attr("class", "graph")
      .datum(d3.merge(unidades.features.map(function(a) { return a.neighbors.map(function(b) { return [a, b]; }); })))
      .attr("d", function(d) { return d.map(function(l) { return "M" + l[0].centroid + "L" + l[1].centroid; }).join(""); });
});
