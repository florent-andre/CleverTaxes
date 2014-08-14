var http = require("http");
var url = require("url");

function start(route) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Requête reçue pour le chemin " + pathname + ".");
    route(pathname);
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }
  http.createServer(onRequest).listen(8888);
  console.log("Démarrage du serveur.");
}

exports.start = start;


/*
var http = require("http");

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}).listen(8888);
*/


/*
var http = require("http");

function onRequest(request, response) {
  console.log("Requête reçue.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World vfff");
  response.end();
}

http.createServer(onRequest).listen(8888);
console.log("Démarrage du serveur.");
*/
