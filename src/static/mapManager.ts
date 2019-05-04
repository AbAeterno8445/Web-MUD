import {dngnTiles} from "./../consts/dngnTiles";
import { ClientTile } from "./clientTile";
import { ClientEntity } from "./clientEntity";

export class MapManager {
    private _mapTiles: ClientTile[][] = new Array();
    private _mapTileImages: any = {};
    private _mapWidth: number = 0;
    private _mapHeight: number = 0;
    private _loaded: boolean = false;

    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;

    constructor(canvas: HTMLCanvasElement, canvasW: number, canvasH: number) {
        // Init canvas
        this.setCanvas(canvas, canvasW, canvasH);

        // Necessary misc tiles
        this.loadTile("EXPLORED");
    }

    // GET/SET map tiles
    get mapTiles(): any[] { return this._mapTiles; }
    set mapTiles(tiledata: any[]) {
        this._loaded = false;
        if (tiledata) {
            this._mapHeight = tiledata.length;
            this._mapWidth = tiledata[0].length;

            this._mapTiles = new Array();
            for (var i = 0; i < this._mapHeight; i++) {
                this._mapTiles.push([]);
                for (var j = 0; j < this._mapWidth; j++) {
                    var origTile = tiledata[i][j];
                    var newTile = new ClientTile(j, i, origTile._tileID);
                    newTile.flags = origTile._flags;
                    this._mapTiles[i].push(newTile);
                }
            }

            this._loaded = true;
        }
    }

    /** Returns the tile at the given position */
    public getTileAt(x: number, y: number): ClientTile {
        if (this._loaded) {
            if (x >= 0 && x < this._mapWidth && y >= 0 && y < this._mapHeight) {
                var tile = this._mapTiles[y][x];
                if (tile) {
                    return tile;
                }
            }
        }
        return undefined;
    }

    /** Set canvas and its size */
    public setCanvas(canvas: HTMLCanvasElement, canvasW: number, canvasH: number): void {
        this._canvas = canvas;
        this._canvas.width = canvasW;
        this._canvas.height = canvasH;
        this._canvasContext = canvas.getContext('2d');
    }

    /** Loads a single tile's image */
    public loadTile(tile: string) {
        if (tile in this._mapTileImages == false) {
            this._mapTileImages[tile] = new Image();
            this._mapTileImages[tile].src = "assets/sprites/" + dngnTiles[tile];
        }
    }

    /** Loads multiple tiles, receives a dictionary formatted as a map file's 'tileData' object */
    public loadTiles(tileList: any) {
        for (var tile in tileList) {
            this.loadTile(tileList[tile]);
        }
    }

    /** Draw a tile into the canvas */
    public drawTile(tileID: string, x: number, y: number): void {
        var tileImg = this._mapTileImages[tileID];
        if (tileImg) {
            this._canvasContext.drawImage(tileImg, x, y);
        }
    }

    /** Reset tile visibility for the whole map */
    public resetTileVis(): void {
        this._mapTiles.forEach(function(row) {
            row.forEach(function(tile) {
                tile.visible = false;
            });
        });
    }

    public do_fov(x: number, y: number, radius: number, row: number, startSlope: number, endSlope: number, xx: number, xy: number, yx: number, yy: number): void {
        if (startSlope < endSlope) return;

        var nextStartSlope = startSlope;
        for (var i = row; i < radius + 1; i++) {
            var blocked = false;
            for (var dx = -i, dy = -i; dx <= 0; dx++) {
                var LSlope = (dx - 0.5) / (dy + 0.5);
                var RSlope = (dx + 0.5) / (dy - 0.5);

                if (startSlope < RSlope) continue;
                else if (endSlope > LSlope) break;

                var sax = dx * xx + dy * xy;
                var say = dx * yx + dy * yy;
                if ((sax < 0 && Math.abs(sax) > x) || (say < 0 && Math.abs(say) > y)) continue;

                var ax = x + sax;
                var ay = y + say;
                if (ax >= this._mapWidth || ay >= this._mapHeight) continue;

                var tile = this.mapTiles[ay][ax];
                if (!tile) continue;

                var radius2 = radius * radius;
                if ((dx * dx + dy * dy) < radius2) {
                    tile.visible = true;
                }

                if (blocked) {
                    if (tile.hasFlag('ns')) {
                        nextStartSlope = RSlope;
                        continue;
                    } else {
                        blocked = false;
                        startSlope = nextStartSlope;
                    }
                } else if (tile.hasFlag('ns')) {
                    blocked = true;
                    nextStartSlope = RSlope
                    this.do_fov(x, y, radius, i + 1, startSlope, LSlope, xx, xy, yx, yy);
                }
            }
            if (blocked) break;
        }
    }

    public castVisibility(x: number, y: number, radius: number) {
        var multipliers = [
            [1, 0, 0, -1, -1, 0, 0, 1],
            [0, 1, -1, 0, 0, -1, 1, 0],
            [0, 1, 1, 0, 0, -1, -1, 0],
            [1, 0, 0, 1, -1, 0, 0, -1]
        ];
        this.resetTileVis();
        this._mapTiles[y][x].visible = true;
        for (var i = 0; i < 8; i++) {
            this.do_fov(x, y, radius, 1, 1.0, 0.0, multipliers[0][i], multipliers[1][i], multipliers[2][i], multipliers[3][i]);
        }
    }

    /** Draws the map scene into the canvas     
     *  Receives the main player object */
    public drawScene(mPlayer: ClientEntity): void {
        if (!this._loaded) return;

        // Clear canvas
        this._canvasContext.clearRect(0, 0, 800, 600);

        // Visibility
        this.castVisibility(mPlayer.posX, mPlayer.posY, mPlayer.sightRange);

        // Draw map around player
        var borderdistX = Math.ceil(this._canvas.width / 64);
        var borderdistY = Math.ceil(this._canvas.height / 64);
        var minX = Math.max(0, mPlayer.posX - borderdistX);
        var maxX = Math.min(this._mapWidth, mPlayer.posX + borderdistX);
        var minY = Math.max(0, mPlayer.posY - borderdistY);
        var maxY = Math.min(this._mapHeight, mPlayer.posY + borderdistY);

        var drawOffsetX = this._canvas.width / 2 - 16 - mPlayer.posX * 32;
        var drawOffsetY = this._canvas.height / 2 - 16 - mPlayer.posY * 32;
        for (var i = minY; i < maxY; i++) {
            for (var j = minX; j < maxX; j++) {
                var tile = this._mapTiles[i][j];
                if (tile && (tile.visible || (!tile.visible && tile.explored))) {
                    tile.explored = true;
                    this.drawTile(tile.tileID, drawOffsetX + j * 32, drawOffsetY + i * 32);
                    if (!tile.visible) {
                        this.drawTile("EXPLORED", drawOffsetX + j * 32, drawOffsetY + i * 32);
                    }
                }
            }
        }
    }
}