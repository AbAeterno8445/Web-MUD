import express from 'express';
import {AccountHandler} from './account-handler';
import {SessionHandler} from './session-handler';

const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const uuid = require('uuid');
const {OAuth2Client} = require('google-auth-library');

// Init express app & server
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var accHandler = new AccountHandler();
var sessionHandler = new SessionHandler();
const client = new OAuth2Client("858342257243-cq6gsi1djkukgq3vlhkat4ir3maa922m.apps.googleusercontent.com");

app.set("views", __dirname);
app.set("view engine", "ejs");
app.set('port', 5000);

// add & configure middleware
app.use(session({
  genid: (request: any) => {
    return uuid(); // use UUIDs for session IDs
  },
  secret: 'qpwoeiruty',
  resave: false,
  saveUninitialized: true
}));
app.use('/static', express.static(__dirname + '/static'));
app.use(express.urlencoded());

// Google verify
async function verify(token: string, callback: any) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "858342257243-cq6gsi1djkukgq3vlhkat4ir3maa922m.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];

  callback(userid);
};

// Session authentication
function authSession(req: any, res: any, next: any) {
  if (sessionHandler.findSession(req.sessionID) == undefined) {
    res.redirect('/');
  } else next();
}

// Routing
app.get('/', function(request, response) {
  response.render('index.ejs');
});

// Google sign-in
app.post('/tokensignin', function(request, response) {
  verify(request.body.idtoken, function(userid: string) {
    accHandler.createAccountAsync(userid);
    sessionHandler.createSession(request.sessionID, userid);
    response.redirect('/charselect');
  });
});

// Character selection
app.get('/charselect', authSession, function(request, response) {
  response.render('charselect.ejs');
});

// Character creation
app.get('/createchar', authSession, function(request, response) {
  response.render('charcreation.ejs');
});

// Character creation processing
app.post('/createchar_act', authSession, function(request, response) {
  
});

// Game
app.get('/game', authSession, function(request, response) {
  response.render('game.ejs');
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
io.on('connection', function(socket: any) {
});

const players: any = {};
io.on('connection', function(socket: any) {
  socket.on('new player', function() {
    players[socket.id] = {
      x: 300,
      y: 300
    };
  });
  socket.on('movement', function(data: any) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  });
});
setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);