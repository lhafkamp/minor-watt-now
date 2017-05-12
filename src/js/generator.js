const d3 = require('d3');
const io = require('socket.io-client');

const socket = io.connect();

const data = [];
const predictions = [];
const performances = [];

const ticks = 30;

const containerWidth = document.querySelector('#chart').parentNode.offsetWidth;

const margin = {top: 20, right: 50, bottom: 30, left: 20};
const width = containerWidth - margin.left - margin.right;
const height = 350 - margin.top - margin.bottom;

let minDate = new Date();
let maxDate = d3.timeMinute.offset(minDate, -ticks);

const parseTime = d3.timeFormat('%H:%M');

const chart = d3.select('#chart')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const x = d3
  .scaleTime()
  .domain([minDate, maxDate])
  .range([0, width]);

const y = d3
  .scaleLinear()
  .domain([0, 120000])
  .range([height, 0]);

const smoothLine = d3.line()
  .x(d => x(d.minDate))
  .y(d => y(d.average));

const lineArea = d3.area()
  .x(d => x(d.minDate))
  .y0(d => y(d.min))
  .y1(d => y(d.max));

// Draw the axis
const xAxis = d3
  .axisBottom()
  .tickFormat(d => {
    const date = d3.timeMinute.offset(d, -ticks);
    return parseTime(date);
  })
  .scale(x);

const yAxis = d3
  .axisRight()
  .tickFormat(d => `${d / 1000}K`)
  .tickSize(-width)
  .scale(y);

const axisX = chart.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`)
  .call(xAxis);

const axisY = chart.append('g')
  .attr('class', 'y axis')
  .attr('transform', `translate(${width}, 0)`)
  .call(yAxis);

// Append the holder for line chart and fill area
const areaPath = chart
  .append('g')
  .attr('transform', `translate(${x(d3.timeMinute.offset(maxDate, 1))})`)
  .append('path');

const path = chart
  .append('g')
  .attr('transform', `translate(${x(d3.timeMinute.offset(maxDate, 1))})`)
  .append('path');

socket.on('dataPoint', point => {
  point.minDate = new Date(point.timestamp * 1000);
  point.maxDate = d3.timeMinute.offset(point.minDate, ticks);

  minDate = point.minDate;
  maxDate = point.maxDate;

  tick(point);
});

socket.on('predicted', point => {
  point.date = new Date(point.timestamp * 1000);

  if (point.type === 'prediction') {
    drawPrediction(point);
  } else if (point.type === 'performance') {
    drawPerformances(point);
  }
});

function drawPrediction(point) {
  if (point) {
    predictions.push(point);
  }

  chart.selectAll('.prediction').remove();

  chart.selectAll('.prediction')
      .data(predictions)
    .enter().append('circle')
      .attr('class', 'prediction')
      .style('fill', d => d.kind === 'spike' ? '#F12D4B' : '#27C86A')
      .attr('r', 5)
      .attr('cx', d => x(d3.timeMinute.offset(d.date, ticks)))
      .attr('cy', d => y(d.average));
}

function drawPerformances(point) {
  if (point) {
    performances.push(point);
  }

  chart.selectAll('.performance').remove();

  chart.selectAll('.performance')
      .data(performances)
    .enter().append('rect')
      .attr('class', 'performance')
      .style('fill', d => d.kind === 'start' ? '#F12D4B' : '#27C86A')
      .attr('width', 20)
      .attr('height', 20)
      .attr('transform', 'translate(-10, -10)')
      .attr('x', d => x(d3.timeMinute.offset(d.date, ticks)))
      .attr('y', d => y(d.average));
}

// Main loop
function tick(point) {
  data.push(point);

  // Remote old data (max 20 points)
  if (data.length > ticks + 1) {
    data.shift();
  }

  // Draw new fill area
  areaPath.datum(data)
    .attr('class', 'area')
    .attr('d', lineArea);

  // Draw new line
  path.datum(data)
    .attr('class', 'smoothline')
    .attr('d', smoothLine);

  // Shift the chart left
  x.domain([minDate, maxDate]);

  axisY
    .call(yAxis);

  axisX
    .call(xAxis);

  drawPrediction();
  drawPerformances();
}
