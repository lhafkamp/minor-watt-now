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
let rangetwo = [];
let inclinations = [];
let credit;
let spike;
let drop;

app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

fs.readFile('./src/data/messages.json', (err, data) => {
  if (err) {
    throw err;
  }
  credit = JSON.parse(data).filter(data => data.type === 'credit');
  spike = JSON.parse(data).filter(data => data.type === 'spike');
  drop = JSON.parse(data).filter(data => data.type === 'drop');
});

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
  let i = 2400;
  tick();

  function tick() {
    i++;
    if (data[i]) {
      algorithm(data[i]);
      io.sockets.emit('dataPoint', data[i]);
      setTimeout(tick, 200);
    }
  }
}

function algorithm(measurement) {
  range = range.slice(-6).concat(measurement);
  // rangetwo = range.slice(-2).concat(measurement);

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
    percentage > 0 ? console.log(`+${percentage}%`) : console.log(`${percentage}%`);
  }

  // if (rangetwo.length > 2) {
  //   inclinations = inclinations.slice(-1).concat(((Number(rangetwo[2].max) + Number(rangetwo[1].max) + Number(rangetwo[0].max)) / 3));
  // }
  // let fuck;
  // if (inclinations.length > 1) {
  //   fuck = Math.round(((inclinations[1] / inclinations[0]) * 100) - 100);
  //   console.log(fuck);
  // }
  // if (fuck > 10) {
  //   io.sockets.emit('predicted', rangetwo[rangetwo.length - 1]);
  // }

  if (percentage > 80) {
    range[range.length - 1].type = 'prediction';
    range[range.length - 1].kind = 'spike';
    io.sockets.emit('predicted', range[range.length - 1]);
    io.sockets.emit('newMessage', spike);
  }
  // if (percentage < -50) {
  //   io.sockets.emit('predicted', range[range.length - 1]);
  // }
}

setTimeout(() => {
  io.sockets.emit('newMessage', credit);
}, 16000);

setTimeout(() => {
  io.sockets.emit('removeMessage', credit);
}, 22000);

setTimeout(() => {
  io.sockets.emit('newMessage', credit);
}, 28000);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
