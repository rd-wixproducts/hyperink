var http_port = 3000,
	ws_port = 9000;
var BufferReadStream = require('streamers').BufferReadStream;
var express = require('express');
var ws = require('streamws');
var wss =  new ws.Server({
	host: '0.0.0.0',
    chunkSize: 40960,
    port: ws_port
})

wss.on('connection', function(socket){
	console.log('real con')
	socket.binaryType = 'arraybuffer'
	socket.on('message', function(data){
		// console.log('got from anish', data)
		// broadcast(data.data)
		broadcast(new BufferReadStream(data, {chunkSize: 40960}))
	})
});

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

var counter = 0;

function broadcast(stream, meta){
	// var file = fs.createWriteStream('yolo/'+counter+'.jpg');
	// stream.pipe(file)
	// counter++;

	var count = 0;
	for(var id in bs.clients){
      if(bs.clients.hasOwnProperty(id)){
      	count++;
        var otherClient = bs.clients[id];
		// console.log('hey client', id)
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
	client.on('stream', function(stream, meta){
	  // var file = fs.createWriteStream(meta.file);
	  // stream.pipe(file);
		console.log('hay anish')
		broadcast(stream, meta)
	}); 
	
});

// app.listen(http_port)
// console.log("YOLO @ " + http_port);
server.listen(http_port);