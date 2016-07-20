var POS_TO_NAME = {
  "ADJ": {"id":1, "name":"adjective"},
  "ADP": {"id":2, "name":"adposition"},
  "ADV": {"id":3, "name":"adverb"},
  "AUX": {"id":4, "name":"auxiliary verb"},
  "CONJ":  {"id":5, "name":"coordinating conjunction"},
  "DET":   {"id":6, "name":"determiner"},
  "INTJ":  {"id":7, "name":"interjection"},
  "NOUN":  {"id":8, "name":"noun"},
  "NUM":   {"id":9, "name":"numeral"},
  "PART":  {"id":10, "name":"particle"},
  "PRT":  {"id":10, "name":"particle"},
  "PRON":  {"id":11, "name":"pronoun"},
  "PROPN": {"id":12, "name":"proper noun"},
  "PUNCT": {"id":13, "name":"punctuation"},
  "SCONJ": {"id":14, "name":"subordinating conjunction"},
  "SYM":   {"id":15, "name":"symbol"},
  "VERB":  {"id":16, "name":"verb"},
  "X":     {"id":17, "name":"other"}
};

function viz(graph) {
  console.log(graph);
  var svg = d3.select("#chart").append("svg:svg"),
      width = 500,
      height = 250;

  svg
    .style("width", width)
    .style("height", height)
    .style("opacity", 0.0)
    .transition()
    .duration(2000)
    .style("opacity", 1.0)


  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.form; }).distance(60))
      .force("charge", d3.forceManyBody(-20))
      .force("collide", d3.forceCollide(20).iterations(1))
      .force("center", d3.forceCenter(width / 2, height / 2));


    var verticies = [];
    for (var i in graph) {
      for (var j in graph) {
        if (graph[j].id == graph[i].head) {
          verticies.push({"source":graph[i].form, "target":graph[j].form});
          break;
        }
      }
    }

    // build the arrow.
  svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
      .attr("id", String)
      .style("fill", "#999")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 19)
      .attr("refY", 0)
      .attr("markerWidth", 3)
      .attr("markerHeight", 3)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(verticies)
      .enter().append("line")
      .attr("marker-end", "url(#end)")
      .attr("stroke-width", function(d) { return 3; });

    var node = svg.selectAll("g.node")
      .data(graph)
      .enter().append("svg:g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("svg:circle")
      .attr("class", "node")
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("r", 10)
      .style("stroke-width", 2)
      .style("stroke", "white")
      .attr("fill", function(d) { return color(POS_TO_NAME[d.cpostag].id); });

    node.append("svg:text")
      .attr("font-size","16px")
      .style("font-weight", "bold")
      .attr("class", "nodetext")
      .attr("dx", "15")
      .attr("dy", "0")
      .text(function(d) { return d.form });

    node.append("svg:text")
      .attr("font-size","12px")
      .attr("class", "nodetext")
      .attr("dx", 15)
      .attr("dy", 12)
      .text(function(d) { return d.cpostag });

    simulation
        .nodes(graph)
        .on("tick", ticked);

    simulation.force("link")
        .links(verticies);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
