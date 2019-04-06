import express from 'express';
import {AccountHandler} from './account-handler';
import {CharacterHandler} from './character-handler';
import {SessionHandler} from './session-handler';
import {Map} from './map';

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
  if (sessionHandler.findSessionByID(req.sessionID)) {
    res.redirect('/charselect');
  } else next();
}

// Session authentication
function authSession(req: any, res: any, next: any) {
  if (sessionHandler.findSessionByID(req.sessionID) == undefined) {
    res.redirect('/');
  } else next();
}

// Session authentication with selected character
function authSessionChar(req: any, res: any, next: any) {
  var sess = sessionHandler.findSessionByID(req.sessionID);
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
  var session = sessionHandler.findSessionByID(request.sessionID);
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
  var sess = sessionHandler.findSessionByID(request.sessionID);
  var acc = accHandler.getAccountByName(sess.accName);

  if (acc.inGame == false) {
    response.render('game.ejs');
  } else {
    console.log("Session", request.sessionID, "login denied - already logged in!");
    var errorMsg: string = "Already logged in!";
    response.render('errorpage.ejs', {errorMsg});
  }
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

const players: any = {};
const testMap: Map = new Map();
testMap.loadFromFile("test.json");
function updatePlayerChar(socketID: any, character: any): void {
  if (players[socketID]) {
    players[socketID] = character.getClientDict();
  }
}

io.on('connection', function(socket: any) {
  var playerSession = sessionHandler.findSessionByID(socket.handshake.sessionID);
  var playerAcc = accHandler.getAccountByName(playerSession.accName);
  var playerChar = charHandler.getCharByID(playerSession.selectedChar);

  // Player joins
  socket.on('new player', function() {
    playerAcc.inGame = true;  // Remove this to enable double-logging
    playerChar.moveTo(2, 2);
    players[socket.id] = playerChar.getClientDict();
    io.sockets.connected[socket.id].emit('mapdata', testMap.getClientDict());
  });

  // Player movement
  socket.on('movement', function(data: any) {
    var plX = playerChar.posX;
    var plY = playerChar.posY;
    if (data.n) { // North
      if (testMap.tileCollFree(plX, plY-1)) playerChar.moveDir(0, -1);
    } else if (data.ne) { // Northeast
      if (testMap.tileCollFree(plX+1, plY-1)) playerChar.moveDir(1, -1);
    } else if (data.e) { // East
      if (testMap.tileCollFree(plX+1, plY)) playerChar.moveDir(1, 0);
    } else if (data.se) { // Southeast
      if (testMap.tileCollFree(plX+1, plY+1)) playerChar.moveDir(1, 1);
    } else if (data.s) { // South
      if (testMap.tileCollFree(plX, plY+1)) playerChar.moveDir(0, 1);
    } else if (data.sw) { // Southwest
      if (testMap.tileCollFree(plX-1, plY+1)) playerChar.moveDir(-1, 1);
    } else if (data.w) { // West
      if (testMap.tileCollFree(plX-1, plY)) playerChar.moveDir(-1, 0);
    } else if (data.nw) { // Northwest
      if (testMap.tileCollFree(plX-1, plY-1)) playerChar.moveDir(-1, -1);
    } 
    updatePlayerChar(socket.id, playerChar);
  });

  // Player disconnects
  socket.on('disconnect', function() {
    delete players[socket.id];
    playerAcc.inGame = false;
  });
});

// Process tick
setInterval(function() {
  // Update player characters
  for (var pl in players) {
    var char = charHandler.getCharByID(players[pl].id);
    if (char) {
      char.update();
    }
  }

  // Send state to players
  io.sockets.emit('state', players);
}, 1000 / 60);