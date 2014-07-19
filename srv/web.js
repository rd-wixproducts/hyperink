var express = require('express')

var app = express();
app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
	// res.end('yolo dawg maaan')
	res.redirect('/demo.html')
	// res.sendfile(__dirname + '/demo.html')
})

var port = 3000;
app.listen(port)
console.log("YOLO @ " + port);