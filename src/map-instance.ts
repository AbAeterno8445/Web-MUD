import {Map} from "./map";
import { Character } from "./character";

export class MapInstance {
    private _io: any;
    private _map: Map;
    private _clientList: any = {};

    constructor(map: Map, io: any) {
        this._map = map;
        this._io = io;
    }

    // GET map
    get map(): Map { return this._map; }

    // GET client list
    get clientList(): any { return this._clientList; }

    /** Add a client to the instance */
    public addClient(socketID: any, clChar: Character): void {
        if (clChar.id in this._clientList == false) {
            this._map.loadEntity(clChar);
            clChar.curInstance = this;
            clChar.curMap = this.map.name;
            this._clientList[socketID] = clChar;

            // Send map data to player
            this.emitTo(socketID, 'mapdata', this.map.getClientDict());
            // Set player data
            this.emitTo(socketID, 'setentitydata', {id: -1, entData: clChar.getClientDict()});
            // New player creation for others
            this.emitOthers(socketID, 'newentity', clChar.getClientDict());
            // Other entities for new player
            for (var e in this.map.entityList) {
                var ent = this.map.entityList[e];
                if (ent === clChar) continue;
                this.emitTo(socketID, 'newentity', ent.getClientDict());
            }
        }
    }

    /** Find a client given its id, returns undefined if none found */
    public findClient(socketID: any): Character {
        if (socketID in this._clientList) {
            return this._clientList[socketID];
        }
        return undefined;
    }

    /** Remove a client from the instance */
    public removeClient(socketID: any): void {
        if (socketID in this._clientList) {
            var entID = this._clientList[socketID].id;
            this.emitOthers(socketID, 'delentity', {id: entID});
            this._map.removeEntity(entID);
            delete this._clientList[socketID];
        }
    }

    /** Emit socket message to given client */
    public emitTo(socketID: any, channel: string, data: any): void {
        if (socketID in this._clientList) {
            if (socketID in this._io.sockets.connected) {
                this._io.sockets.connected[socketID].emit(channel, data);
            } else {
                this.removeClient(socketID);
            }
        }
    }

    /** Emit socket message to all but given client */
    public emitOthers(socketID: any, channel: string, data: any): void {
        for (var otherID in this._clientList) {
            if (otherID == socketID) continue;

            this.emitTo(otherID, channel, data);
        }
    }

    /** Emit socket message to all clients */
    public emitAll(channel: string, data: any): void {
        for (var sockID in this._clientList) {
            this.emitTo(sockID, channel, data);
        }
    }

    /** Send message to particular player client */
    public msgTo(client: any, msg: string, color: string, prefix: string): void {
        this.emitTo(client, 'msg', {msg: msg, col: color, pref: prefix});
    }

    /** Send message to all but given player client */
    public msgOthers(client: any, msg: string, color: string, prefix: string): void {
        this.emitOthers(client, 'msg', {msg: msg, col: color, pref: prefix});
    }

    /** Send message to players near position (within 8 tiles) */
    public msgLocal(x: number, y: number, msg: string, color: string, prefix: string): void {
        for (var cl in this._clientList) {
            var clChar = this._clientList[cl];
            if (Map.distBetweenPos(x, y, clChar.posX, clChar.posY) <= 8) {
                this.msgTo(cl, msg, color, prefix);
            }
        }
    }

    /** Send message to all players in this instance */
    public msgAll(msg: string, color: string, prefix: string): void {
        this.emitAll('msg', {msg: msg, col: color, pref: prefix});
    }

    /** Returns a new position from the bind spot for respawning players */
    public getNewBindPos(): number[] {
        var bindPos = new Array();
        var xOff = Math.floor(Math.random()*(this.map.bindRad*2+1)-this.map.bindRad);
        var yOff = Math.floor(Math.random()*(this.map.bindRad*2+1)-this.map.bindRad);
        bindPos.push(this.map.bindX + xOff, this.map.bindY + yOff);
        return bindPos;
    }

    /** Move client character in a direction */
    public clientCharMoveDir(socketID: any, dirX: number, dirY: number): void {
        if (socketID in this._clientList) {
            var playerChar = this._clientList[socketID];
            var plX = playerChar.posX;
            var plY = playerChar.posY;
            if (this.map.tileCollFree(plX + dirX, plY + dirY)) {
                playerChar.moveDir(dirX, dirY);
                this.emitTo(socketID, 'mventity', {id: -1, x: playerChar.posX, y: playerChar.posY});
                this.emitOthers(socketID, 'mventity', {id: playerChar.id, x: playerChar.posX, y: playerChar.posY});
            }
        }
    }

    /** Move client character directly to position, ignoring movement cooldowns. Can ignore collision */
    public clientCharMoveTo(socketID: any, x: number, y: number, collision: boolean): void {
        if (socketID in this._clientList) {
            var playerChar = this._clientList[socketID];
            if (!collision || (collision && this.map.tileCollFree(x, y))) {
                playerChar.moveTo(x, y);
                this.emitTo(socketID, 'mventity', {id: -1, x: playerChar.posX, y: playerChar.posY});
                this.emitOthers(socketID, 'mventity', {id: playerChar.id, x: playerChar.posX, y: playerChar.posY});
            }
        }
    }

    /** Client attempts to attack position */
    public clientCharAttack(socketID: any, dirX: number, dirY: number): void {
        if (socketID in this._clientList) {
            var playerChar = this._clientList[socketID];
            if (playerChar.canAttack()) {
                var plX = playerChar.posX;
                var plY = playerChar.posY;
                var target = this.map.findEntityAt(plX + dirX, plY + dirY);
                if (target) {
                    // Check if target is not player
                    for (var cl in this.clientList) {
                        if (this.clientList[cl] === target) return;
                    }
                    var targID = target.id;
                    this.map.entityAttackEnt(playerChar, target);
                    if (target.hp > 0) {
                        this.emitAll('setentitydata', {id: targID, entData: target.getClientDict()});
                        this.emitTo(socketID, 'msg', {msg: "You attack " + target.name + "!", col: "f77", pref: ""});
                        for (var c in this._clientList) {
                            if (this._clientList[c] == target) {
                                this.emitTo(c, 'setentitydata', {id: -1, entData: target.getClientDict()});
                                break;
                            }
                        }
                    } else {
                        this.emitAll('delentity', {id: targID});
                        this.emitTo(socketID, 'msg', {msg: "You kill " + target.name + "!", col: "fbb", pref: ""});
                    }
                }
            }
        }
    }

    /** Process tick for this instance */
    public update(): void {
        this.map.update();
    }
}