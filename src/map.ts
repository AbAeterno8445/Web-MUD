import {Tile} from "./tile";
import { Entity } from "./entity";
import { monTiles } from "./consts/monTiles";

const mapTileLimit = 64;
const defaultTile = "UNSEEN";
const fs = require('fs');
const path = require('path');

export class Map {
    private _mapTiles: Tile[][];
    private _mapTileData: any = {};
    private _name: string;
    private _width: number;
    private _height: number;
    private _entityList: any = {};
    private _entityIDcounter: number = 0;
    private _bind: boolean = false;
    private _bindX: number = 1;
    private _bindY: number = 1;
    private _bindRad: number = 1;
    private _tpX: number = 1;
    private _tpY: number = 1;
    private _tpRad: number = 1;

    constructor() {
        this._name = "Unknown";
        this._width = 5;
        this._height = 5;

        this._mapTiles = new Array();
        for (let i = 0; i < this._width; i++) {
            this._mapTiles.push([]);
            for (let j = 0; j < this._height; j++) {
                this._mapTiles[i].push(new Tile(j, i, defaultTile));
            }
        }

        /*
        for (var i = 0; i < 5; i++) {
            var keys = Object.keys(monTiles);
            var entSpr = keys[keys.length * Math.random() << 0];
            this.loadEntity(new Entity("monstro", 2, 6+i, entSpr));
        }*/
    }

    // GET/SET name
    get name(): string { return this._name; }
    set name(n: string) { this._name = n; }

    // GET/SET width
    get width(): number { return this._width; }
    set width(w: number) {
        if (w > 1 && w < mapTileLimit) {
            this._width = w;
        }
    }
    
    // GET/SET height
    get height(): number { return this._height; }
    set height(h: number) {
        if (h > 1 && h < mapTileLimit) {
            this._height = h;
        }
    }

    // GET bind spot X
    get bindX(): number { return this._bindX; }

    // GET bind spot Y
    get bindY(): number { return this._bindY; }

    // GET bind area radius
    get bindRad(): number { return this._bindRad; }

    // GET entity list
    get entityList(): any { return this._entityList; }

    /** Generate an entity ID for this map */
    public genEntityID(): number {
        this._entityIDcounter++;
        return this._entityIDcounter;
    }

    /** Loads the map json file, relative from maps directory */
    public loadFromFile(mapName: string, callback: Function): void {
        var filePath = path.join(__dirname, "maps/" + mapName + ".json");
        fs.readFile(filePath, 'utf-8', function(err: any, data: any) {
            if (err) {
                console.log(err);
                callback(false);
            };

            var mapObj = JSON.parse(data);
            this._name = mapObj["name"];
            this._height = mapObj["mapTiles"].length;
            this._width = mapObj["mapTiles"][0].length;
            this._mapTileData = mapObj["tileData"];

            // Tile loading
            this._mapTiles = new Array();
            mapObj["mapTiles"].forEach(function(row: any, i: number) {
                this._mapTiles.push([]);
                mapObj["mapTiles"][i].forEach(function(col: string, j: number) {
                    var tileData = col.split(":");
                    var tileID = this._mapTileData[tileData[0]];

                    var newTile = new Tile(j, i, tileID);

                    // Tile flags
                    if (tileData.length > 1) {
                        for (var k = 1; k < tileData.length; k++) {
                            var flag = tileData[k];
                            var flagData = flag.split('/');
                            newTile.addFlag(flagData[0]);
                            // Special flags
                            if (flagData.length > 1) {
                                switch(flagData[0]) {
                                    // Bind spot (bind radius)
                                    case "bind":
                                        this._bindX = j;
                                        this._bindY = i;
                                        this._bindRad = +flagData[1];
                                    break;
                                    // Town portal area (area radius)
                                    case "tparea":
                                        this._tpX = j;
                                        this._tpY = i;
                                        this._tpRad = +flagData[1];
                                    break;
                                }
                            }
                        }
                    }
                    this._mapTiles[i].push(newTile);
                }.bind(this));
            }.bind(this));
            
            callback(true);
        }.bind(this));
    }

    /** Returns the client data dictionary for this map     
     * Client side map should be constructed based on this data */
    public getClientDict(): any {
        var clientDict = {
            tiles: this._mapTiles,
            tileData: this._mapTileData
        }
        return clientDict;
    }

    /** Returns whether the given position is currently walkable */
    public tileCollFree(x: number, y: number): boolean {
        var tile = this._mapTiles[y][x];
        if (tile) {
            if (!tile.hasFlag("w") && !this.findEntityAt(x, y)) {
                return true;
            }
        }
        return false;
    }

    /** Returns the distance between two positions */
    static distBetweenPos(x1: number, y1: number, x2: number, y2: number): number {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    /** Load a previously created entity into the map */
    public loadEntity(ent: Entity): void {
        if (ent.id && ent.id in this._entityList && this._entityList[ent.id] == ent) {
            return;
        }
        ent.id = this.genEntityID();
        this._entityList[ent.id] = ent;
    }

    /** Find and return an entity from the map given its id, returns undefined if not found */
    public findEntity(id: number): Entity {
        if (id in this._entityList) {
            return this._entityList[id];
        }
        return undefined;
    }

    /** Find and return an entity given its position, returns undefined if no entity is there */
    public findEntityAt(x: number, y: number): Entity {
        for (var e in this._entityList) {
            var ent = this._entityList[e];
            if (ent.posX === x && ent.posY === y) {
                return ent;
            }
        }
        return undefined;
    }

    /** Remove an entity from the map */
    public removeEntity(id: number): void {
        if (id in this._entityList) {
            delete this._entityList[id];
        }
    }

    /** Makes an entity attempt to attack given position    
     *  Returns 0 if no target entity, 1 if attack on cooldown, 2 if successful */
    public entityAttackPos(ent: Entity, x: number, y: number): number {
        if (ent.id in this._entityList) {
            var targetEnt = this.findEntityAt(x, y);
            if (targetEnt) {
                if (ent.canAttack()) {
                    ent.resetAttackCD();
                    targetEnt.hp -= ent.dmgPhys;
                    if (targetEnt.hp <= 0) {
                        this.removeEntity(targetEnt.id);
                    }
                    return 2;
                }
                return 1;
            }
        }
        return 0;
    }

    /** Makes an entity attack another one */
    public entityAttackEnt(ent: Entity, target: Entity): void {
        if (ent.id in this._entityList && target.id in this._entityList) {
            if (ent.canAttack()) {
                ent.resetAttackCD();
                target.hp -= ent.dmgPhys;
                if (target.hp <= 0) {
                    this.removeEntity(target.id);
                }
            }
        }
    }

    /** Process tick for this map */
    public update(): void {
        for (var e in this._entityList) {
            var ent = this._entityList[e];
            ent.update();
        }
    }
}