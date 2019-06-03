import { MapInstance } from './map-instance';
import { Map } from './map';
import { Character } from './character';

/**
 * Instances variable structure:    
 * _instances -> object that holds all maps defined in static mapList   
 * _instances["town"] -> object that holds created instances for map "town"     
 * _instances["town"]["John"] -> Array of instances for map "town", player John     
 */
export class InstanceManager {
    private _instances: any = {};
    private _io: any;

    /** List of maps used in instance loading; use this when creating new instances */
    public static mapList = {
        huge: "huge",
        small: "small"
    }
    /** Default map, should be loaded when no map is found for a player.    
     *  Should always have a global instance available. */
    public static defaultBind = InstanceManager.mapList.huge;

    constructor(io: any) {
        this._io = io;

        /** Every map has a base global instance, shared by all players. Create these here */
        for (var map in InstanceManager.mapList) {
            this.createInstance(map, "global", () => {});
        }
    }

    /** Create a new instance for the given map */
    public createInstance(baseMap: string, owner: string, callback: Function): void {
        var newMap = new Map();
        newMap.loadFromFile(baseMap, (loaded: boolean) => {
            if (loaded) {
                var mapInst = new MapInstance(newMap, this._io);
                if (baseMap in this._instances == false) {
                    this._instances[baseMap] = {};
                }
                if (owner in this._instances[baseMap] == false) {
                    this._instances[baseMap][owner] = new Array();
                }
                this._instances[baseMap][owner].push(mapInst);
                callback(mapInst);
            } else {
                callback(undefined);
            }
        });
    }

    /** Get a particular owner's instance. Returns undefined if not found */
    public getParticularInstance(baseMap: string, owner: string, index: number): MapInstance {
        if (!index) index = 0;
        if (baseMap in this._instances) {
            if (owner in this._instances[baseMap]) {
                if (this._instances[baseMap][owner].length > index) {
                    return this._instances[baseMap][owner][index];
                }
            }
        }
        return undefined;
    }

    /** Return a map's global instance if it exists, returns undefined otherwise */
    public getGlobalInstance(baseMap: string): MapInstance {
        return this.getParticularInstance(baseMap, "global", 0);
    }

    /** Return the instance a joining player should enter   
     *  When leaving, players persist on their last map for 5 minutes. Past that time, they'll join their
     *  last bound map instead (usually towns).*/
    public playerFirstJoin(charSocket: any, char: Character): void {
        var plInst = this.getGlobalInstance(char.curMap);
        if (!plInst) {
            plInst = this.getGlobalInstance(char.boundMap);
        }
        // Bound map - place player around binding spot
        if (char.boundMap == plInst.map.name) {
            var spawnPos = plInst.getNewBindPos();
            char.moveTo(spawnPos[0], spawnPos[1]);
        }
        plInst.addClient(charSocket, char);
        plInst.msgTo(charSocket, "Welcome, " + char.name + "!", "fff", "");
        this.runOnAllInstances((inst: MapInstance) => {
            inst.msgOthers(charSocket, char.name + " has joined.", "fff", "");
        });
    }

    /** Run the callback function over all created instances */
    public runOnAllInstances(callback: Function): void {
        for (var map in this._instances) {
            for (var owner in this._instances[map]) {
                this._instances[map][owner].forEach(function(inst: MapInstance) {
                    callback(inst);
                });
            }
        }
    }
}