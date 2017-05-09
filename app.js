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
let arr = [];

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

function algorithm(item) {
  arr = arr.slice(-9).concat(item);
  console.log(arr);
}

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
