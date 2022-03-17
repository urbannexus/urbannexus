var matrix = [
  [9.6899, 0.8859, 0.0554, 0.443, 2.5471, 2.4363, 0.5537, 2.5471], /*Apple 19.1584*/
  [0.1107, 1.8272, 0, 0.4983, 1.1074, 1.052, 0.2215, 0.4983], /*HTC 5.3154*/
  [0.0554, 0.2769, 0.2215, 0.2215, 0.3876, 0.8306, 0.0554, 0.3322], /*Huawei 2.3811*/
  [0.0554, 0.1107, 0.0554, 1.2182, 1.1628, 0.6645, 0.4983, 1.052], /*LG 4.8173*/
  [0.2215, 0.443, 0, 0.2769, 10.4097, 1.2182, 0.4983, 2.8239], /*Nokia 15.8915*/
  [1.1628, 2.6024, 0, 1.3843, 8.7486, 16.8328, 1.7165, 5.5925], /*Samsung 38.0399*/
  [0.0554, 0.4983, 0, 0.3322, 0.443, 0.8859, 1.7719, 0.443], /*Sony 4.4297*/
  [0.2215, 0.7198, 0, 0.3322, 1.6611, 1.495, 0.1107, 5.4264] /*Other 9.9667*/
];
var names = [
  'Apple', 'HTC', 'Huawei', 'LG', 'Nokia', 'Samsung', 'Sony', 'Other'
];

// The following code is the typical routine of my d3.js code. 
const svg = d3.select('svg');
const width = svg.attr('width');
const height = svg.attr('height');
svg.attr("viewBox", [-width / 2, -height / 2, width, height]);

const innerRadius = Math.min(width, height) * 0.5 - 90;
const outerRadius = innerRadius + 10;

// d3.chord
var chord = d3.chordDirected().padAngle(10 / innerRadius).sortSubgroups(d3.descending).sortChords(d3.descending);
// chord为由matrix（N维）方阵生成的N*N条弦数据
// chord.groups为大小为N的数据组
const chords = chord(matrix);

const color = d3.scaleOrdinal(names, d3.quantize(d3.interpolateRainbow, names.length));
// const color = d3.scaleOrdinal().domain(names).range(d3.schemePastel1);
// const color = d3.scaleOrdinal().domain(names).range(d3.schemeSet3);
const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

// 此group为按chords.groups的数量建立起来的图形g分组
var group = svg.append('g')
  .attr("font-size", 10)
  .attr("font-family", "sans-serif")
  .selectAll("g")
  .data(chords.groups)
  .join("g");
// 为每一个分组绘制弧形
group.append("path")
  .attr("fill", d => color(names[d.index]))
  .attr("d", arc);

group.append("text")
  .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
  .attr("dy", "0.35em")
  .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 5})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
  .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
  .text(d => names[d.index]);

group.append("title")
  .text(d => `${names[d.index]}
${d3.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
${d3.sum(chords, c => (c.target.index === d.index) * c.source.value)} incoming ←`);

const ribbon = d3.ribbonArrow().radius(innerRadius - 1).padAngle(1 / innerRadius);
svg.append("g")
  .attr("fill-opacity", 0.75)
  .selectAll("path")
  .data(chords)
  .join("path")
  .style("mix-blend-mode", "multiply")
  .attr("fill", d => color(names[d.target.index]))
  .attr("d", ribbon)
  .append("title")
  .text(d => `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`)