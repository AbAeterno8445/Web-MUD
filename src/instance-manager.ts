import { MapInstance } from './map-instance';
import { Map } from './map';
ºimport { Character } from './character';

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
    public static defaultMap = InstanceManager.mapList.huge;

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
    public getPlayerJoinMap(char: Character): MapInstance {
        var lastMap = this.getGlobalInstance(char.curMap);
        var boundMap = this.getGlobalInstance(char.boundMap);
        if (!lastMap) {
            return boundMap;
        }
        return lastMap;
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