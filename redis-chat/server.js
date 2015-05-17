var WSServer = require('ws').Server;
var redis = require('redis');
var redisSub = redis.createClient();
var redisPub = redis.createClient();

var server = require('http').createServer(
  require('ecstatic')({root: __dirname +  '/public'})
);

var wss = new WSServer({server: server});
wss.on('connection', function(ws) {
  console.log('Client connected');
  ws.on('message', function(msg) {
    console.log('Message sent:', msg);
    redisPub.publish('chat_messages', msg);
  });
});

redisSub.subscribe('chat_messages');
redisSub.on('message', function(channel, msg) {
  wss.clients.forEach(function(client, idx) {
    console.log('Message received:', msg, idx);
    client.send(msg);
  });
});

server.listen(process.argv[2] || 8080);