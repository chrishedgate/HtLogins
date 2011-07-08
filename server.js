var	sio = require('socket.io'),
	http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	sys = require('sys');

var server = http.createServer(function(req, res) {
	var uri = url.parse(req.url).pathname;
	var filename = path.join(process.cwd(), uri);
	path.exists(filename, function(exists) {
		if (!exists) {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Not found...');
			return;
		}

		fs.readFile(filename, "binary", function(err, file) {
			if (err) {
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end(err + '\n');
				return;
			}

			res.writeHead(200);
			res.end(file, "binary");
		});
	});
});

server.listen(80);

var lines;
var ready = false;
var now;

fs.readFile("loginObjects.txt", "utf-8", function(err, data) {
	if (err) throw (err);
	lines = data.split('\r\n');
	console.log("Read data");

	now = new Date(JSON.parse(lines[0]).loginDate);

	ready = true;
});

var io = sio.listen(server);

var n = 0;

io.sockets.on("connection", function(socket) {
});

function checkForLogins() {
	if(!ready) return;

	var done = false;
	now = new Date(now.valueOf() + 1000);

console.dir(now);
	
	while(!done) {
		var line = JSON.parse(lines[n]);
		var lineDate = new Date(line.loginDate);
console.dir(lineDate);
		if(line && lineDate < now) {
/*
			var options = {
				host: '',
				port: 80,
				path: ''
			};

			http.get(options, function(res) {
			}).on('error', function(e) {
				console.log('http error');
			});
*/
			var longitude = line.latitude;
			var latitude = line.longitude;
			io.sockets.json.send({"data": {"longitude":longitude,"latitude":latitude}});
			n++;
		} else {
			done = true;
		}
	}
}

setInterval(checkForLogins, 1000);
