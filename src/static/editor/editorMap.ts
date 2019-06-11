import {Tile} from "./../../tile";

const mapTileLimit = 64;
const defaultTile = "UNSEEN";
const fs = require('fs');
const path = require('path');

export class EditorMap {
    private _mapTiles: Tile[][];
    private _mapTileData: any = {};
    private _loaded: boolean = false;
    private _name: string;
    private _width: number;
    private _height: number;

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
    }

    // GET/SET name
    get name(): string { return this._name; }
    set name(n: string) { this._name = n; }

    // GET map loaded
    get loaded(): boolean { return this._loaded; }

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

    // GET map tile matrix
    get mapTiles(): Tile[][] { return this._mapTiles; }

    // GET map tile data
    get mapTileData(): any { return this._mapTileData; }

    /** Loads the map from a json-type string */
    public loadFromJSON(mapData: string): void {
        this._loaded = false;

        var mapObj = JSON.parse(mapData);
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

        this._loaded = true;
    }

    /** Returns the distance between two positions */
    static distBetweenPos(x1: number, y1: number, x2: number, y2: number): number {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    /** Get tile at position, undefined if none */
    public getTileAt(tileX: number, tileY: number): Tile {
        if (this._mapTiles[tileY] != undefined && this._mapTiles[tileY][tileX] != undefined) {
            return this._mapTiles[tileY][tileX];
        }
        return undefined;
    }

    /** Replaces tile at position with given tile, returns whether replacement was successful */
    public replaceTile(tileX: number, tileY: number, newTile: Tile): boolean {
        if (this.getTileAt(tileX, tileY)) {
            this._mapTiles[tileY][tileX] = newTile;
            return true;
        }
        return false;
    }

    /** Flood fills the clicked region of tiles with the given tile */
    public floodFillAt(tileX: number, tileY: number, newTile: Tile): void {
        var sourceTile = this.getTileAt(tileX, tileY);
        if (sourceTile && sourceTile.tileID != newTile.tileID) {
            this.floodFill(tileX, tileY, sourceTile.tileID, newTile);
        }
    }

    /** Flood fill recursive process */
    private floodFill(x: number, y: number, srcTileID: string, newTile: Tile): void {
        var curTile = this.getTileAt(x, y);
        if (curTile && curTile.tileID == srcTileID) {
            var newTileCopy = Tile.copyTile(newTile);
            newTileCopy.posX = x;
            newTileCopy.posY = y;
            this.replaceTile(x, y, newTileCopy);
            
            this.floodFill(x+1, y, srcTileID, newTile);
            this.floodFill(x-1, y, srcTileID, newTile);
            this.floodFill(x, y+1, srcTileID, newTile);
            this.floodFill(x, y-1, srcTileID, newTile);
        }
    }
}