import express from 'express';
import {AccountHandler} from './account-handler';
import {CharacterHandler} from './character-handler';
import {SessionHandler} from './session-handler';
import {Map} from './map';
import {monTiles} from './consts/monTiles';
import {MapInstance} from './mapInstance';

const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const uuid = require('uuid');
const path = require('path');

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
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use('/style', express.static(path.join(__dirname, 'style')));
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
  var charImgPathDict: any = {};
  acc.characters.forEach(id => {
    var char = charHandler.getCharByID(id);
    if (char) {
      charList.push(charHandler.getCharByID(id));
      charImgPathDict[id] = monTiles[char.tileID];
    }
  });

  response.render('charselect.ejs', {charList, charImgPathDict, accName});
});

// Character selection processing
app.get('/charselect_act', authSession, function(request, response) {
  var session = sessionHandler.findSessionByID(request.sessionID);
  var acc = accHandler.getAccountByName(session.accName);
  var id = +request.query.id;

  console.log("Session " + request.sessionID + " attempts to log with character " + id);
  if (acc.hasCharacter(id)) {
    console.log("SUCCESS");
    session.setSelectedChar(id);
    response.redirect('/game');
  } else {
    console.log("DENIED");
    response.redirect('/charselect');
  }
});

// Character creation
app.get('/createchar', authSession, function(request, response) {
  var charCreationList = charHandler.charCreationList;
  var charCreationPathDict: any = {};
  charCreationList.forEach(function(charTile) {
    charCreationPathDict[charTile] = monTiles[charTile];
  });
  response.render('charcreation.ejs', {charCreationList, charCreationPathDict});
});

// Character creation processing
app.post('/createchar_act', authSession, function(request, response) {
  var char_name = request.body.inp_charname;
  var char_sprite_index = +request.body.charSprite;
  if (char_sprite_index >= charHandler.charCreationList.length) {
    char_sprite_index = 0;
  }
  var char_sprite = charHandler.charCreationList[char_sprite_index];
  
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

const testMap: Map = new Map();
testMap.loadFromFile("huge.json");
const players: any = {};
const testInstance: MapInstance = new MapInstance(testMap, io);
const mapInstances: MapInstance[] = new Array();
mapInstances.push(testInstance);

// Dictionary for directional actions
const dirDict: any = {
  n: [0, -1],
  ne: [1, -1],
  e: [1, 0],
  se: [1, 1],
  s: [0, 1],
  sw: [-1, 1],
  w: [-1, 0],
  nw: [-1, -1]
}

io.on('connection', function(socket: any) {
  var playerSession = sessionHandler.findSessionByID(socket.handshake.sessionID);
  var playerAcc = accHandler.getAccountByName(playerSession.accName);
  var playerChar = charHandler.getCharByID(playerSession.selectedChar);

  // Player joins
  socket.on('newpl', function() {
    playerAcc.inGame = true;  // Remove this to enable double-logging
    playerChar.moveTo(2, 2);
    players[socket.id] = playerChar;
    testInstance.addClient(socket.id, playerChar);
    testInstance.msgTo(socket.id, "Welcome, " + playerChar.name + "!", "fff", "");
    testInstance.msgOthers(socket.id, playerChar.name + " has joined.", "fff", "");
  });

  // Player movement
  socket.on('movement', function(data: any) {
    if (data.dir in dirDict) {
      var dirList = dirDict[data.dir];
      testInstance.clientCharMove(socket.id, dirList[0], dirList[1]);
    }
  });

  // Player attack
  socket.on('attack', function(data: any) {
    if (data.dir in dirDict) {
      var dirList = dirDict[data.dir];
      testInstance.clientCharAttack(socket.id, dirList[0], dirList[1]);
    }
  });

  // Player disconnects
  socket.on('disconnect', function() {
    testInstance.removeClient(socket.id);
    playerAcc.inGame = false;
    delete players[socket.id];
    testInstance.msgOthers(socket.id, playerChar.name + " has left.", "fff", "");
  });

  // Player chat
  socket.on('chatmsg', function(msg: string) {
    var msgPref = msg[0];
    if (msgPref == '/') {
      // Player commands
      var msgArgs = msg.split(' ');
      switch(msgArgs[0]) {
        // Who's online
        case "/who":
          var playerList = new Array();
          mapInstances.forEach(function(inst: any) {
            for (var client in inst.clientList) {
              playerList.push(inst.clientList[client].name);
            }
          });
          var whoMsg = "Connected players: ";
          playerList.forEach(function(name: any, i: number) {
            whoMsg += name;
            if (i < playerList.length - 1) {
              whoMsg += ", ";
            }
          });
          testInstance.msgTo(socket.id, whoMsg, "fff", "");
        break;

        // Whisper player
        case "/msg":
          var recipient = msgArgs[1].replace('_', ' ');
          var whisperMsg = msgArgs.slice(2).join(' ');
          var success = false;
          for (var pl in players) {
            var plChar = players[pl];
            if (plChar.name == recipient) {
              if (plChar === playerChar) {
                testInstance.msgTo(socket.id, "You mutter to yourself: " + whisperMsg, "9A2EFE", "<");
              } else {
                testInstance.msgTo(pl, playerChar.name + " tells you: " + whisperMsg, "9A2EFE", "<");
                testInstance.msgTo(socket.id, "You tell " + plChar.name + ": " + whisperMsg, "D358F7", ">");
              }
              success = true;
              break;
            }
          }
          if (!success) {
            testInstance.msgTo(socket.id, "No player named " + recipient + "!", "FE2E2E", "");
          }
        break;
      }
    } else if (msgPref == '#') {
      // Global chat
      msg = msg.slice(1);
      mapInstances.forEach(function(inst: any) {
        inst.msgAll(playerChar.name + ": " + msg, "f80", "G");
      });
    } else {
      // Local chat
      testInstance.msgAll(playerChar.name + ": " + msg, "cff", "");
    }
  });
});

// Process tick
setInterval(function() {
  // Update maps
  testInstance.update();
}, 1000 / 60);