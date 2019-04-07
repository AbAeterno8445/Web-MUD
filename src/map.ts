import {Tile} from "./tile";

const mapTileLimit = 64;
const defaultTile = 0;
const fs = require('fs');
const path = require('path');

export class Map {
    private _mapTiles: Tile[][];
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

    /** Loads the map json file, relative from maps directory */
    public loadFromFile(file: string): void {
        var filePath = path.join(__dirname, "maps/" + file);
        fs.readFile(filePath, 'utf-8', function(err: any, data: any) {
            if (err) throw err;

            var mapObj = JSON.parse(data);
            this._name = mapObj["name"];
            this._height = mapObj["mapTiles"].length;
            this._width = mapObj["mapTiles"][0].length;

            // Tile loading
            this._mapTiles = new Array();
            mapObj["mapTiles"].forEach(function(row: any, i: number) {
                this._mapTiles.push([]);
                mapObj["mapTiles"][i].forEach(function(col: string, j: number) {
                    var tileData = col.split(":");

                    var newTile = new Tile(j, i, +tileData[0]);

                    // Tile flags
                    if (tileData.length > 1) {
                        for (var k = 1; k < tileData.length; k++) {
                            newTile.addFlag(tileData[k]);
                        }
                    }
                    this._mapTiles[i].push(newTile);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }

    /** Returns the client data dictionary for this map     
     * Client side map should be constructed based on this data */
    public getClientDict(): any {
        var clientDict = {
            tiles: this._mapTiles
        }
        return clientDict;
    }

    /** Resizes the map */
    public resize(w: number, h: number): void {
        const old_width = this.width;
        const old_height = this.height;

        this.width = w;
        this.height = h;

        // Resize width
        if (this.width > old_width) {
            for (let i = 0; i < old_height; i++) {
                for (let j = old_width; j < this.width; j++) {
                    this._mapTiles[i].push(new Tile(j, i, defaultTile));
                }
            }
        } else if (this.width < old_width) {
            for (let i = 0; i < old_height; i++) {
                for (let j = old_width; j > this.width; j--) {
                    this._mapTiles[i].pop();
                }
            }
        }

        // Resize height
        if (this.height > old_height) {
            for (let i = old_height; i < this.height; i++) {
                this._mapTiles.push([]);
                for (let j = 0; j < this.width; j++) {
                    this._mapTiles[i].push(new Tile(j, i, defaultTile));
                }
            }
        } else if (this.height < old_height) {
            for (let i = old_height; i > this.height; i--) {
                this._mapTiles.pop();
            }
        }
    }

    /** Returns whether the given position is currently walkable */
    public tileCollFree(x: number, y: number): boolean {
        var tile = this._mapTiles[y][x];
        if (tile) {
            if (!tile.hasFlag("w")) {
                return true;
            }
        }
        return false;
    }
}