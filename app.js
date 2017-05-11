const fs = require('fs');
const path = require('path');
const http = require('http').Server;
const express = require('express');
const socketio = require('socket.io');
const parse = require('csv-parse');

const app = express();
const server = http(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

let deviations = [];
let range = [];
let simData = '';
let upData = '';
let downData = '';

app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

fs.readFile('./src/data/mock.csv', (err, data) => {
  if (err) {
    throw err;
  }
  parse(data, {columns: ['timestamp', 'average', 'min', 'max']}, (error, output) => {
    if (error) {
      throw error;
    }
    interval(output);
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/generator', (req, res) => {
  res.render('generator');
});

function interval(data) {
  let i = -1;
  tick();

  function tick() {
    i++;
    if (data[i]) {
      algorithm(data[i]);
      io.sockets.emit('dataPoint', data[i]);
      setTimeout(tick, 100);
    }
  }
}

function algorithm(measurement) {
  range = range.slice(-4).concat(measurement);
  const average = range.reduce((acc, result, i) => {
    if (i === range.length - 1) {
      return ((acc + Number(result.max)) / range.length);
    }
    return acc + Number(result.max);
  }, 0);

  const variance = range.reduce((acc, result, i) => {
    if (i === range.length - 1) {
      return ((acc + Math.pow((Number(result.max) - average), 2)) / range.length);
    }
    return acc + Math.pow((Number(result.max) - average), 2);
  }, 0);

  deviations = deviations.slice(-1).concat(Math.round(Math.sqrt(variance)));

  let percentage;

  if (deviations.length > 1 && deviations[0] !== 0) {
    percentage = Math.round(((deviations[1] / deviations[0]) * 100) - 100);
    // console.log(deviations[1]);
    percentage > 0 ? console.log(`+${percentage}%`) : console.log(`${percentage}%`);
  }

  if (percentage > 100) {
    io.sockets.emit('newMessage', 'OMG piek incoming bitch');
  }
}

fs.readFile('./src/data/messages.json', (err, data) => {
  if (err) {
    throw err;
  }
  simData = JSON.parse(data).filter(data => data.type === 'sim');
  upData = JSON.parse(data).filter(data => data.type === 'stroomup');
  downData = JSON.parse(data).filter(data => data.type === 'stroomdown');
});

// io.on('connection', socket => {
//   setTimeout(() => {
//     socket.emit('newMessage', simData);
//   }, 1000);
//
//   setTimeout(() => {
//     socket.emit('newMessage', upData);
//   }, 7000);
//
//   setTimeout(() => {
//     socket.emit('newMessage', downData);
//   }, 8500);
//
//   setTimeout(() => {
//     socket.emit('removeMessage', upData);
//   }, 10000);
// });

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
