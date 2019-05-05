import {Map} from "./map";
import { Entity } from "./entity";

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

    /** Add a client to the instance */
    public addClient(socketID: any, clChar: Entity): void {
        if (clChar.id in this._clientList == false) {
            this._map.loadEntity(clChar);
            this._clientList[socketID] = clChar;

            // Send map data to player
            this.emitTo(socketID, 'mapdata', this.map.getClientDict());
            // Set player data
            this.emitTo(socketID, 'setentitydata', {id: -1, entData: clChar.getClientDict()});
            // New player creation for others
            this.emitOthers(socketID, 'newentity', clChar.getClientDict());
            // Other entity creation for new player
            for (var e in this.map.entityList) {
                var ent = this.map.entityList[e];
                if (ent === clChar) continue;
                this.emitTo(socketID, 'newentity', ent.getClientDict());
            }
        }
    }

    /** Find a client given its id, returns undefined if none found */
    public findClient(socketID: any): Entity {
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
        this._io.sockets.emit(channel, data);
    }

    /** Move client character */
    public clientCharMove(socketID: any, dirX: number, dirY: number): void {
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

    /** Client attempts to attack position */
    public clientCharAttack(socketID: any, dirX: number, dirY: number): void {
        if (socketID in this._clientList) {
            var playerChar = this._clientList[socketID];
            var plX = playerChar.posX;
            var plY = playerChar.posY;
            var target = this.map.findEntityAt(plX + dirX, plY + dirY);
            if (target) {
                var targID = target.id;
                this.map.entityAttackEnt(playerChar, target);
                if (target.hp > 0) {
                    this.emitAll('setentitydata', {id: targID, entData: target.getClientDict()});
                    for (var c in this._clientList) {
                        if (this._clientList[c] == target) {
                            this.emitTo(c, 'setentitydata', {id: -1, entData: target.getClientDict()});
                            break;
                        }
                    }
                } else {
                    this.emitAll('delentity', {id: targID});
                }
            }
        }
    }

    /** Process tick for this instance */
    public update(): void {
        this.map.update();
    }
}