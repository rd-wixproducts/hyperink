var http_port = 3000,
	ws_port = 9000;

var express = require('express');
var BinaryServer = require('binaryjs').BinaryServer;

var app = express();
var server = require('http').Server(app);
var bs = BinaryServer({ server: server });
var os = require('os'),
	fs = require('fs'),
	path = require('path')
var Busboy = require('busboy');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.redirect('/demo.html')
})

function broadcast(stream, meta){
	var count = 0;
	for(var id in bs.clients){
      if(bs.clients.hasOwnProperty(id)){
      	count++;
        var otherClient = bs.clients[id];
		console.log('hey client', id)
		var send = otherClient.createStream(meta);
		stream.pipe(send);
      }
    }
    if(count == 0){
    	// walp no listeners
    	stream.on('data', function(){})
    }
}

app.post('/end', function (req, res) {
	var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    	broadcast(file, { wumbo: true })
		console.log('YOLO DAWG')
    });
    busboy.on('finish', function() {
      res.writeHead(200, { 'Connection': 'close' });
      res.end("Stay thirsty, my friends.");
    });
    return req.pipe(busboy);
})


bs.on('connection', function(client){
	// client.on('stream', function(stream, meta){
	//   var file = fs.createWriteStream(meta.file);
	//   stream.pipe(file);
	// }); 
	
});

// app.listen(http_port)
// console.log("YOLO @ " + http_port);
server.listen(http_port);