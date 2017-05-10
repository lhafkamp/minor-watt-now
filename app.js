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
let range = [];

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

function interval(data) {
  let i = -1;
  tick();

  function tick() {
    i++;
    if (data[i]) {
      algorithm(data[i]);
      setTimeout(tick, 1000);
    }
  }
}

function algorithm(measurement) {
  range = range.slice(-9).concat(measurement);
  const average = range.reduce((acc, result, i) => {
    if (i === range.length - 1) {
      return ((acc + Number(result.average)) / range.length);
    }
    return acc + Number(result.average);
  }, 0);

  const variance = range.reduce((acc, result, i) => {
    if (i === range.length - 1) {
      return ((acc + Math.pow((Number(result.average) - average), 2)) / range.length);
    }
    return acc + Math.pow((Number(result.average) - average), 2);
  }, 0);

  const deviation = Math.sqrt(variance);
  console.log(deviation);
}

// example of sending JSON messages to the client
let simData = '';
let upData = '';
let downData = '';

fs.readFile('./src/data/messages.json', (err, data) => {
  simData = JSON.parse(data).filter(data => data.type === 'sim');
  upData = JSON.parse(data).filter(data => data.type === 'stroomup');
  downData = JSON.parse(data).filter(data => data.type === 'stroomdown');
});

io.on('connection', (socket) => {
  // timeout to fake an incoming message
  // TODO replace this with the algorithm and send simData/upData/downData accordingly

  setTimeout(() => {
    socket.emit('newMessage', simData);
  }, 3000);

  setTimeout(() => {
    socket.emit('newMessage', upData);
  }, 7000);

  setTimeout(() => {
    socket.emit('newMessage', downData);
  }, 8500);
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
