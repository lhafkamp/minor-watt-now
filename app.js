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

app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

fs.readFile('./mock.csv', {columns: ['timestamp', 'average', 'min', 'max']}, (err, data) => {
  if (err) {
    throw err;
  }
  parse(data, (err, output) => {
    if (err) {
      throw err;
    }
    console.log(output);
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/generator', (req, res) => {
  res.render('generator');
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
