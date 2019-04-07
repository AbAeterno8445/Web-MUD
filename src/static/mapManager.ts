export class MapManager {
    private _mapTiles: any[];
    private _loaded: boolean = false;

    private _tileImg: any;
    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;
    private _entityList: any[];

    constructor(tileSheetImg: any, canvas: HTMLCanvasElement, canvasW: number, canvasH: number) {
        this._mapTiles = new Array();
        this._tileImg = tileSheetImg;

        // Init canvas
        this.setCanvas(canvas, canvasW, canvasH);
    }

    // GET/SET map tiles
    get mapTiles(): any[] { return this._mapTiles; }
    set mapTiles(tiledata: any[]) {
        this._mapTiles = tiledata;
        if (tiledata) {
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

    /** Draw the scene into the canvas  
     *  Scene refers to the map and all its entities correctly layered */
    public drawScene(players: any[]): void {
        if (!this._loaded) return;

        // Clear canvas
        this._canvasContext.clearRect(0, 0, 800, 600);
        // Draw map
        this._mapTiles.forEach(function(row: any, i: number) {
            row.forEach(function(tile: any, j: number) {
                this._canvasContext.drawImage(this._tileImg, (tile._tileID % 64) * 32, Math.floor(tile._tileID / 64) * 32, 32, 32, j * 32, i * 32, 32, 32);
            }.bind(this));
        }.bind(this));
        // Draw entities
        for (var id in players) {
            var entity = players[id];
            this._canvasContext.drawImage(this._tileImg, (entity.tileID % 64) * 32, Math.floor(entity.tileID / 64) * 32, 32, 32, entity.drawX, entity.drawY, 32, 32);
        }
    }
}