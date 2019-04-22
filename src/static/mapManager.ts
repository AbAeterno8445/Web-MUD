import { ClientEntity } from "./clientEntity";

export class MapManager {
    private _mapTiles = new Array();
    private _mapWidth: number = 0;
    private _mapHeight: number = 0;
    private _loaded: boolean = false;

    private _tileImg: any;
    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;
    private _entityList: any[];
    private _player: ClientEntity;
    private _playerDict: any = {};

    constructor(tileSheetImg: any, canvas: HTMLCanvasElement, canvasW: number, canvasH: number) {
        this._tileImg = tileSheetImg;

        // Init canvas
        this.setCanvas(canvas, canvasW, canvasH);
    }

    // SET main player
    set player(p: ClientEntity) { this._player = p; }

    // SET player dict
    set playerDict(pdict: any[]) {
        this._playerDict = {};
        pdict.forEach(function(pl) {
            var tmpPlayer = new ClientEntity(pl.drawX, pl.drawY, pl.tileID);
            this._playerDict[pl.id] = tmpPlayer;
        });
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

    /** Draw a tile into the canvas */
    private drawTile(tileID: number, x: number, y: number) {
        this._canvasContext.drawImage(this._tileImg, (tileID % 64) * 32, Math.floor(tileID / 64) * 32, 32, 32, x, y, 32, 32);
    }

    /** Set canvas and its size */
    public setCanvas(canvas: HTMLCanvasElement, canvasW: number, canvasH: number): void {
        this._canvas = canvas;
        this._canvas.width = canvasW;
        this._canvas.height = canvasH;
        this._canvasContext = canvas.getContext('2d');
    }

    public setPlayerTile(id: number, tile: number): void {
        if (id === -1) {
            this._player.tileID = tile;
        } else if (this._playerDict[id]) {
            this._playerDict[id].tileID = tile;
        }
    }

    /** Draw the scene into the canvas  
     *  Scene refers to the map and all its entities correctly layered */
    public drawScene(players: any[]): void {
        if (!this._loaded) return;

        // Clear canvas
        this._canvasContext.clearRect(0, 0, 800, 600);

        // Draw map around player
        var sightRange = 5;

        var minX = Math.max(0, this._player.posX - sightRange);
        var maxX = Math.min(this._mapWidth, this._player.posX + sightRange);
        var minY = Math.max(0, this._player.posY - sightRange);
        var maxY = Math.min(this._mapHeight, this._player.posY + sightRange);

        console.log(minX, maxX);

        var drawOriginX = this._canvas.width / 2 - 16 - sightRange * 32;
        var drawOriginY = this._canvas.height / 2 - 16 - sightRange * 32;
        for (var i = minY; i < maxY; i++) {
            for (var j = minX; j < maxX; j++) {
                var tile = this._mapTiles[j][i];
                this.drawTile(tile._tileID, drawOriginX + j * 32, drawOriginY + i * 32);
            }
        }
        /*this._mapTiles.forEach(function(row: any, i: number) {
            row.forEach(function(tile: any, j: number) {
                // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                this._canvasContext.drawImage(this._tileImg, (tile._tileID % 64) * 32, Math.floor(tile._tileID / 64) * 32, 32, 32, j * 32, i * 32, 32, 32);
            }.bind(this));
        }.bind(this));*/

        // Draw entities
        /*
        for (var id in players) {
            var entity = players[id];
            this.drawTile(entity.tileID, entity.posX * 32, entity.posY * 32);
        }*/

        // Draw player (always centered)
        this.drawTile(this._player.tileID, this._canvas.width / 2 - 16, this._canvas.height / 2 - 16);
    }
}