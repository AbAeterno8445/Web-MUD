import express from 'express';
import {AccountHandler} from './account-handler';
import {CharacterHandler} from './character-handler';
import {SessionHandler} from './session-handler';

const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const uuid = require('uuid');

// Init express app & server
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var accHandler = new AccountHandler();
var charHandler = new CharacterHandler();
var sessionHandler = new SessionHandler();

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

// Pages requiring no current session
function noSessionPage(req: any, res: any, next: any) {
  if (sessionHandler.findSession(req.sessionID)) {
    res.redirect('/charselect');
  } else next();
}

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

//// Routing
// Index page
app.get('/', noSessionPage, function(request, response) {
  response.render('index.ejs');
});

// Account creation
app.get('/acc_create', function(request, response) {
  response.render('createaccount.ejs');
});

// Account creation process
app.post('/acc_create_act', function(request, response) {
  var accName = request.body.inp_name;
  var accPass = request.body.inp_password;
  var result = accHandler.createAccountAsync(accName, accPass);

  if (result == 2) {
    // Account creation successful
    response.redirect('/');
  } else {
    response.redirect('/acc_create');
  }
});

// Account login
app.post('/acc_login', function(request, response) {
  var accName = request.body.inp_name;
  var accPass = request.body.inp_password;

  if (accHandler.loginAccount(accName, accPass)) {
    sessionHandler.createSession(request.sessionID, accName);
    response.redirect('/charselect');
  } else {
    response.redirect('/');
  }
});

// Account logout
app.get('/logout', function(request, response) {
  sessionHandler.logoutSession(request.sessionID);
  response.redirect('/');
});

// Character selection
app.get('/charselect', authSession, function(request, response) {
  var accName = sessionHandler.getSessionAccName(request.sessionID);
  var acc = accHandler.getAccountByName(accName);

  // Create table of acc characters from char IDs and char handler
  var charList: any[] = new Array();
  acc.characters.forEach(charID => {
    charList.push(charHandler.getCharByID(charID));
  });

  response.render('charselect.ejs', {charList, accName});
});

// Character selection processing
app.get('/charselect_act', authSession, function(request, response) {
  var session = sessionHandler.findSession(request.sessionID);
  var acc = accHandler.getAccountByName(session.accName);
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
    var accName = sessionHandler.getSessionAccName(request.sessionID);
    accHandler.associateChar(charHandler.getCharByName(char_name).charID, accName);
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