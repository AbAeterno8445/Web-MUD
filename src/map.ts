import {Tile} from "./tile";

const mapTileLimit = 64;
const defaultTile = 0;

export class Map {
    private _mapTiles: Tile[][];
    private _width: number;
    private _height: number;

    constructor(w: number, h: number) {
        this._width = w;
        this._height = h;

        this._mapTiles = new Array();
        for (let i = 0; i < w; i++) {
            this._mapTiles.push([]);
            for (let j = 0; j < h; j++) {
                this._mapTiles[i].push(new Tile(j, i, defaultTile));
            }
        }
    }

    // GET/SET width
    get width(): number {
        return this._width;
    }
    set width(w: number) {
        if (w > 1 && w < mapTileLimit) {
            this._width = w;
        }
    }
    
    // GET/SET height
    get height(): number {
        return this._height;
    }
    set height(h: number) {
        if (h > 1 && h < mapTileLimit) {
            this._height = h;
        }
    }

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
}