var http = require('http');
var api = require('./server')

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.end('Hey ninjas')
}).listen(3000)

console.log(`User token: ${api.getToken()}`)