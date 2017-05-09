const d3 = require('d3');

const generator = () => {
  const margin = {top: 20, right: 20, bottom: 30, left: 50};
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3.scaleTime()
      .range([0, width]);

  const y = d3.scaleLinear()
      .range([height, 0]);

  const line = d3.area()
      .x(d => x(d.date))
      .y(d => y(d.average));

  const area = d3.area()
      .x(d => x(d.date))
      .y1(d => y(d.max));

  const svg = d3.select('body').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  d3.csv('data/mock-small.csv', (error, data) => {
    if (error) {
      throw error;
    }

    data.forEach(d => {
      d.date = new Date(d.timestamp * 1000);

      d.max = +d.max;
      d.min = +d.min;
    });

    x.domain(d3.extent(data, d => d.date));

    y.domain([
      d3.min(data, d => Math.min(d.max, d.min)),
      d3.max(data, d => Math.max(d.max, d.min))
    ]);

    svg.datum(data);

    svg.append('clipPath')
        .attr('id', 'clip-below')
      .append('path')
        .attr('d', area.y0(height));

    svg.append('clipPath')
        .attr('id', 'clip-above')
      .append('path')
        .attr('d', area.y0(0));

    svg.append('path')
        .attr('class', 'area above')
        .attr('clip-path', 'url(#clip-above)')
        .attr('d', area.y0(d => y(d.min)));

    svg.append('path')
        .attr('class', 'area below')
        .attr('clip-path', 'url(#clip-below)')
        .attr('d', area);

    svg.append('path')
        .attr('class', 'line')
        .attr('d', line);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y))
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Temperature (ºF)');
  });
};
module.exports = generator;
