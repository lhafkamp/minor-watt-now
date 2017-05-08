const path = require('path')
const http = require('http').Server
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http(app)
const io = socketio(server)
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '/public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
