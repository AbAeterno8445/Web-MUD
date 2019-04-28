export class MapManager {
    private _mapTiles = new Array();
    private _mapWidth: number = 0;
    private _mapHeight: number = 0;
    private _loaded: boolean = false;

    private _tileImg: any;
    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;

    constructor(tileSheetImg: any, canvas: HTMLCanvasElement, canvasW: number, canvasH: number) {
        this._tileImg = tileSheetImg;

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

    // GET/SET tiles image
    get tileImg(): any { return this._tileImg; }
    set tileImg(img: any) { this._tileImg = img; }

    /** Set canvas and its size */
    public setCanvas(canvas: HTMLCanvasElement, canvasW: number, canvasH: number): void {
        this._canvas = canvas;
        this._canvas.width = canvasW;
        this._canvas.height = canvasH;
        this._canvasContext = canvas.getContext('2d');
    }

    /** Draw a tile into the canvas */
    private drawTile(tileID: number, x: number, y: number) {
        this._canvasContext.drawImage(this._tileImg, (tileID % 64) * 32, Math.floor(tileID / 64) * 32, 32, 32, x, y, 32, 32);
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