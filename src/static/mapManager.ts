import {dngnTiles} from "./../consts/dngnTiles";

export class MapManager {
    private _mapTiles = new Array();
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
        this._mapTiles = tiledata;
        if (tiledata) {
            this._mapHeight = tiledata.length;
            this._mapWidth = tiledata[0].length;

            this._loaded = true;
        } else {
            this._loaded = false;
        }
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
    public drawTile(tileID: string, x: number, y: number) {
        var tileImg = this._mapTileImages[tileID];
        if (tileImg) {
            this._canvasContext.drawImage(tileImg, x, y);
        }
    }

    /** Draws the map scene into the canvas     
     *  Receives the x and y positions of the main player */
    public drawScene(posX: number, posY: number): void {
        if (!this._loaded) return;

        // Clear canvas
        this._canvasContext.clearRect(0, 0, 800, 600);

        // Draw map around player
        var borderdistX = Math.ceil(this._canvas.width / 64);
        var borderdistY = Math.ceil(this._canvas.height / 64);
        var minX = Math.max(0, posX - borderdistX);
        var maxX = Math.min(this._mapWidth, posX + borderdistX);
        var minY = Math.max(0, posY - borderdistY);
        var maxY = Math.min(this._mapHeight, posY + borderdistY);

        var drawOffsetX = this._canvas.width / 2 - 16 - posX * 32;
        var drawOffsetY = this._canvas.height / 2 - 16 - posY * 32;
        for (var i = minY; i < maxY; i++) {
            for (var j = minX; j < maxX; j++) {
                var tile = this._mapTiles[i][j];
                this.drawTile(tile._tileID, drawOffsetX + j * 32, drawOffsetY + i * 32);
            }
        }
    }
}