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
    public addClient(cl: Entity, socketID: any): void {
        if (cl.id in this._clientList == false) {
            this._clientList[socketID] = cl;
            this._map.loadEntity(cl);
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
            delete this._clientList[socketID];
            this._map.removeEntity(socketID);
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
}