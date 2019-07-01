import { sessionHandler, accHandler, charHandler } from './server';
import { InstanceManager } from './instance-manager';
import { MapInstance } from './map-instance';
import { Account } from './account';
import { Character } from './character';

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

/**
 * Manages a single client in parallel to the rest.   
 * _socket is the client socket   
 * _plSession, _plAcc, _plChar: client(player) session, account and character
 */
export class ClientManager {
  private _socket: any;
  private _plSession: any;
  private _plAcc: Account;
  private _plChar: Character;
  private _players: any = {};
  private _instanceMngr: InstanceManager;

  constructor(clSocket: any, instanceMngr: InstanceManager) {
    this._instanceMngr = instanceMngr;

    this._socket = clSocket;
    this._plSession = sessionHandler.findSessionByID(clSocket.handshake.sessionID);
    this._plAcc = accHandler.getAccountByName(this._plSession.accName);
    this._plChar = charHandler.getCharByID(this._plSession.selectedChar);

    // Setup
    this.initSocket();
    // Initial joining
    this.plJoins();
  }

  private initSocket() {
    // Player joins
    this._socket.on('newpl', () => { this.plJoins });
    
    // Player disconnects
    this._socket.on('disconnect', () => { this.plDisconnect(); });

    // Player movement
    this._socket.on('movement', (data: any) => { this.plMovement(data); });

    // Player attack
    this._socket.on('attack', (data: any) => { this.plAttack(data); });

    // Player chat
    this._socket.on('chatmsg', (msg: string) => { this.plChat(msg); });
  }

  /** On player joining */
  private plJoins() {
    this._plAcc.inGame = true;  // Remove this to enable double-logging
    this._players[this._socket.id] = this._plChar;
    this._instanceMngr.playerFirstJoin(this._socket.id, this._plChar);
  }

  /** On player disconnection */
  private plDisconnect() {
    if (!this._plChar.curInstance) return;

    this._plChar.curInstance.removeClient(this._socket.id);
    this._plAcc.inGame = false;
    delete this._players[this._socket.id];
    this._instanceMngr.runOnAllInstances((inst: MapInstance) => {
      inst.msgOthers(this._socket.id, this._plChar.name + " has left.", "fff", "");
    });
  }

  /** On player movement */
  private plMovement(data: any) {
    if (!this._plChar.curInstance) return;

    if (data.dir in dirDict) {
      var dirList = dirDict[data.dir];
      this._plChar.curInstance.clientCharMoveDir(this._socket.id, dirList[0], dirList[1]);
    }
  }

  /** On player attack */
  private plAttack(data: any) {
    if (!this._plChar.curInstance) return;

    if (data.dir in dirDict) {
      var dirList = dirDict[data.dir];
      this._plChar.curInstance.clientCharAttack(this._socket.id, dirList[0], dirList[1]);
    }
  }

  /** On player chat */
  private plChat(msg: string) {
    if (!this._plChar.curInstance) return;

    var msgPref = msg[0];
    if (msgPref == '/') {
      // Player commands
      var msgArgs = msg.split(' ');
      switch (msgArgs[0]) {
        // Who's online
        case "/who":
          var playerList = new Array();
          this._instanceMngr.runOnAllInstances(function (inst: any) {
            for (var client in inst.clientList) {
              playerList.push(inst.clientList[client].name);
            }
          });
          var whoMsg = "Connected players: ";
          playerList.forEach(function (name: any, i: number) {
            whoMsg += name;
            if (i < playerList.length - 1) {
              whoMsg += ", ";
            }
          });
          whoMsg += ".";

          this._plChar.curInstance.msgTo(this._socket.id, whoMsg, "fff", "");
          break;

        // Whisper player
        case "/msg":
          var recipient = msgArgs[1].replace('_', ' ');
          var whisperMsg = msgArgs.slice(2).join(' ');
          var success = false;
          for (var pl in this._players) {
            var targetChar = this._players[pl];
            if (targetChar.name == recipient) {
              if (targetChar === this._plChar) {
                this._plChar.curInstance.msgTo(this._socket.id, "You mutter to yourself: " + whisperMsg, "9A2EFE", "<");
              } else {
                targetChar.curInstance.msgTo(pl, this._plChar.name + " tells you: " + whisperMsg, "9A2EFE", "<");
                this._plChar.curInstance.msgTo(this._socket.id, "You tell " + targetChar.name + ": " + whisperMsg, "D358F7", ">");
              }
              success = true;
              break;
            }
          }
          if (!success) {
            this._plChar.curInstance.msgTo(this._socket.id, "No player named " + recipient + "!", "FE2E2E", "");
          }
          break;

        // Bind to map
        case "/bind":
          var plMap = this._plChar.curInstance.map;
          if (plMap.bind) {
            this._plChar.curInstance.msgTo(this._socket.id, "You are now bound to this map. You will respawn here on death or when logging out.", "fff", "");
            this._plChar.boundMap = plMap.name;
          } else {
            this._plChar.curInstance.msgTo(this._socket.id, "You can't bind to this map!", "fff", "");
          }
          break;

        // Unbind - return binding to default map
        case "/unbind":
          this._plChar.curInstance.msgTo(this._socket.id, "You are now bound to the default map.", "fff", "");
          this._plChar.boundMap = InstanceManager.defaultBind;
          break;

        // DEBUG - teleport to map (/tp <map name> <x> <y> <instance number>)
        // If instance # doesn't exist, a new one is created
        case "/tp":
          var targetMap = this._instanceMngr.getGlobalInstance(msgArgs[1]);
          var targetX = +msgArgs[2];
          var targetY = +msgArgs[3];
          if (targetMap) {
            this._plChar.curInstance.removeClient(this._socket.id);
            targetMap.addClient(this._socket.id, this._plChar);
            targetMap.clientCharMoveTo(this._socket.id, targetX, targetY, false);
          }
          break;
      }
    } else if (msgPref == '#') {
      // Global chat
      msg = msg.slice(1);
      this._instanceMngr.runOnAllInstances((inst: any) => {
        inst.msgAll(this._plChar.name + ": " + msg, "f80", "#");
      });
    } else {
      // Local chat
      this._plChar.curInstance.msgLocal(this._plChar.posX, this._plChar.posY, this._plChar.name + ": " + msg, "cff", "");
    }
  }
}