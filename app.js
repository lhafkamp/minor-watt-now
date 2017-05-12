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

let deviationsMax = [];
let deviationsMin = [];
let range = [];
let rangetwo = [];
let inclinations = [];
let credit;
let spike;
let drop;
let expected;
let performancesStart = [];
let performancesEnd = [];

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
  expected = JSON.parse(data).filter(data => data.type === 'expected');
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

fs.readFile('./public/data/performances.json', (err, data) => {
  if (err) {
    throw err;
  }
  const json = JSON.parse(data);
  json.forEach(performance => {
    performance.start ? performancesStart.push(performance.start) : performancesEnd.push(performance.end);
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/generator', (req, res) => {
  res.render('generator');
});

function interval(data) {
  let i = 2300;
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
  let averageMax;
  let averageMin;
  let varianceMax;
  let varianceMin;
  let percentageMax;
  let percentageMin;

  range = range.slice(-6).concat(measurement);
  // rangetwo = range.slice(-2).concat(measurement);

  Promise.all([calculateAverage('max'), calculateAverage('min')])
    .then(() => {
      calculateVariance('max', averageMax);
      calculateVariance('min', averageMin);
    })
    .then(() => {
      deviationsMax = deviationsMax.slice(-1).concat(Math.round(Math.sqrt(varianceMax)));
      deviationsMin = deviationsMin.slice(-1).concat(Math.round(Math.sqrt(varianceMin)));
    })
    .catch(err => {
      console.error(err);
    });

  function calculateAverage(property) {
    return new Promise((resolve, reject) => {
      try {
        const average = range.reduce((acc, result, i) => {
          if (i === range.length - 1) {
            return ((acc + Number(result[property])) / range.length);
          }
          return acc + Number(result[property]);
        }, 0);
        property === 'max' ? averageMax = average : averageMin = average;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  function calculateVariance(property, average) {
    return new Promise((resolve, reject) => {
      try {
        const variance = range.reduce((acc, result, i) => {
          if (i === range.length - 1) {
            return ((acc + Math.pow((Number(result[property]) - average), 2)) / range.length);
          }
          return acc + Math.pow((Number(result[property]) - average), 2);
        }, 0);
        property === 'max' ? varianceMax = variance : varianceMin = variance;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  if (deviationsMax.length > 1 && deviationsMax[0] !== 0) {
    percentageMax = Math.round(((deviationsMax[1] / deviationsMax[0]) * 100) - 100);
    // percentageMax > 0 ? console.log(`+${percentageMax}%`) : console.log(`${percentageMax}%`);
  }

  if (deviationsMin.length > 1 && deviationsMin[0] !== 0) {
    percentageMin = Math.round(((deviationsMin[1] / deviationsMin[0]) * 100) - 100);
    // console.log(percentageMin);
  }

  if (percentageMax > 80) {
    if (performances)
    range[range.length - 1].type = 'prediction';
    range[range.length - 1].kind = 'spike';
    io.sockets.emit('predicted', range[range.length - 1]);
    // io.sockets.emit('newMessage', spike);
  }

  if (percentageMin > 150) {
    range[range.length - 1].type = 'prediction';
    range[range.length - 1].kind = 'drop';
    io.sockets.emit('predicted', range[range.length - 1]);
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
  //
  // if (percentageMax < -50) {
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
