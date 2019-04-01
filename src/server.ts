import express from 'express';
import {AccountHandler} from './account-handler';
import {CharacterHandler} from './character-handler';
import {SessionHandler} from './session-handler';

const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const uuid = require('uuid');
const {OAuth2Client} = require('google-auth-library');

// Init express app & server
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var accHandler = new AccountHandler();
var charHandler = new CharacterHandler();
var sessionHandler = new SessionHandler();
const client = new OAuth2Client("858342257243-cq6gsi1djkukgq3vlhkat4ir3maa922m.apps.googleusercontent.com");

app.set("views", __dirname);
app.set("view engine", "ejs");
app.set('port', 5000);

// add & configure middleware
var sessionMiddleware = session({
  genid: (request: any) => {
    return uuid(); // use UUIDs for session IDs
  },
  secret: 'qpwoeiruty',
  resave: false,
  saveUninitialized: true
});
app.use(sessionMiddleware);
io.use(sharedsession(sessionMiddleware, {
  autosave: true
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

// Session authentication with selected character
function authSessionChar(req: any, res: any, next: any) {
  var sess = sessionHandler.findSession(req.sessionID);
  if (sess) {
    if (sess.selectedChar) {
      next();
    } else res.redirect('/charselect');
  } else res.redirect('/');
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
  var accID = sessionHandler.getSessionAccID(request.sessionID);
  var acc = accHandler.getAccountByID(accID);
  var charList: any[] = new Array();
  acc.characters.forEach(charID => {
    charList.push(charHandler.getCharByID(charID));
  });
  response.render('charselect.ejs', {charList});
});

// Character selection processing
app.get('/charselect_act', authSession, function(request, response) {
  var session = sessionHandler.findSession(request.sessionID);
  var acc = accHandler.getAccountByID(session.accID);
  var charID = +request.query.charID;

  console.log("Session " + request.sessionID + " attempts to log with character " + charID);
  if (acc.hasCharacter(charID)) {
    console.log("SUCCESS");
    session.setSelectedChar(charID);
    response.redirect('/game');
  } else {
    console.log("DENIED");
    response.redirect('/charselect');
  }
});

// Character creation
app.get('/createchar', authSession, function(request, response) {
  response.render('charcreation.ejs');
});

// Character creation processing
app.post('/createchar_act', authSession, function(request, response) {
  var char_name = request.body.inp_charname;
  var char_sprite = request.body.charSprite;
  
  var result = charHandler.createCharAsync(char_name, char_sprite);
  console.log("Session " + request.sessionID + " attempts to create char " + char_name + ", spr " + char_sprite);
  console.log("Result: " + result);
  if (result == 2) {
    var accID = sessionHandler.getSessionAccID(request.sessionID);
    accHandler.associateChar(charHandler.getCharByName(char_name).charID, accID);
    response.redirect('/charselect');
  } else {
    response.redirect('/createchar');
  }
});

// Game
app.get('/game', authSession, authSessionChar, function(request, response) {
  response.render('game.ejs');
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

const players: any = {};
io.on('connection', function(socket: any) {
  var playerSession = sessionHandler.findSession(socket.handshake.sessionID);
  var playerChar = charHandler.getCharByID(playerSession.selectedChar);

  // Player joins
  socket.on('new player', function() {
    players[socket.id] = {
      x: 300,
      y: 300,
      char: playerChar.tileID
    };
  });

  // Player movement
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

  // Player disconnects
  socket.on('disconnect', function() {
    delete players[socket.id];
  });
});

// Send state to players
setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);