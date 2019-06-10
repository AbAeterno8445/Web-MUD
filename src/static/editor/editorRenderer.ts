import { Tile } from './../../tile';
import { dngnTiles } from './../../consts/dngnTiles';

export class EditorRenderer {
    private _mapTiles: Tile[][] = new Array();
    private _mapTileImages: any = {};
    private _mapWidth: number = 0;
    private _mapHeight: number = 0;
    private _loaded: boolean = false;

    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;

    constructor(canvas: HTMLCanvasElement, canvasW: number, canvasH: number) {
        // Init canvas
        this.setCanvas(canvas, canvasW, canvasH);
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
                    var newTile = new Tile(j, i, origTile._tileID);
                    newTile.addFlags(origTile._flags);
                    this._mapTiles[i].push(newTile);
                }
            }

            this._loaded = true;
        }
    }

    /** Returns the tile at the given position */
    public getTileAt(x: number, y: number): Tile {
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
    public loadTile(tile: string): void {
        if (tile in this._mapTileImages == false) {
            var tileImg = new Image();
            tileImg.setAttribute('loaded', '0');
            tileImg.onload = function() {
                tileImg.setAttribute('loaded', '1');
            };
            tileImg.src = "assets/sprites/" + dngnTiles[tile];
            this._mapTileImages[tile] = tileImg;
        }
    }

    /** Loads multiple tiles, receives a dictionary formatted as a map file's 'tileData' object */
    public loadTiles(tileList: any): void {
        for (var tile in tileList) {
            this.loadTile(tileList[tile]);
        }
    }

    /** Draw a tile into the canvas */
    public drawTile(tileID: string, x: number, y: number): void {
        var tileImg = this._mapTileImages[tileID];
        if (tileImg) {
            // Postpone drawing if not loaded
            if (tileImg.getAttribute('loaded') === '0') {
                setTimeout(() => {
                    this.drawTile(tileID, x, y);
                }, 100);
            }

            this._canvasContext.drawImage(tileImg, x, y);
        } else {
            // Trying to draw unloaded image, load then draw it
            this.loadTile(tileID);
            this.drawTile(tileID, x, y);
        }
    }

    /** Draws the map scene into the canvas */
    public drawScene(offsetX: number, offsetY: number): void {
        if (!this._loaded) return;

        // Clear canvas
        this._canvasContext.clearRect(0, 0, 800, 600);

        // Draw map
        var minX = Math.max(0, Math.floor(-offsetX / 32));
        var minY = Math.max(0, Math.floor(-offsetY / 32));
        var maxX = Math.min(this._mapWidth, Math.ceil((this._canvas.width - offsetX) / 32));
        var maxY = Math.min(this._mapHeight, Math.ceil((this._canvas.height - offsetY) / 32));

        for (var i = minY; i < maxY; i++) {
            for (var j = minX; j < maxX; j++) {
                var tile = this._mapTiles[i][j];
                if (tile) {
                    this.drawTile(tile.tileID, offsetX + j * 32, offsetY + i * 32);
                }
            }
        }
    }
}