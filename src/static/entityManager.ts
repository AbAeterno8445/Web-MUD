import {ClientEntity} from './clientEntity';

export class EntityManager {
    private _tileImg: any;
    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;
    private _entityList: any = {};
    private _player: ClientEntity;

    constructor(tileSheetImg: any, canvas: HTMLCanvasElement, canvasW: number, canvasH: number) {
        this._tileImg = tileSheetImg;

        // Init canvas
        this.setCanvas(canvas, canvasW, canvasH);
    }

    // SET main player
    set player(p: ClientEntity) { this._player = p; }

    /** Receives the other players list */
    public receivePlayers(pdict: any[]) {
        pdict.forEach(function(pl) {
            var tmpPlayer = new ClientEntity(pl.drawX, pl.drawY, pl.tileID);
            this._entityList[pl.id] = tmpPlayer;
        });
    }

    /** Set canvas and its size */
    public setCanvas(canvas: HTMLCanvasElement, canvasW: number, canvasH: number): void {
        this._canvas = canvas;
        this._canvas.width = canvasW;
        this._canvas.height = canvasH;
        this._canvasContext = canvas.getContext('2d');
    }

    /** Draws an entity at a given position */
    public drawEntity(ent: ClientEntity, x: number, y: number) {
        this._canvasContext.drawImage(this._tileImg, (ent.tileID % 64) * 32, Math.floor(ent.tileID / 64) * 32, 32, 32, x, y, 32, 32);
    }

    /** Change a player's tile, use id -1 for main player */
    public setPlayerTile(id: number, tile: number): void {
        if (id === -1) {
            this._player.tileID = tile;
        } else if (this._entityList[id]) {
            this._entityList[id].tileID = tile;
        }
    }

    /** Draw the entities into the canvas */
    public drawEntities() {
        // Clear canvas
        this._canvasContext.clearRect(0, 0, 800, 600);

        var drawOffsetX = this._canvas.width / 2 - 16 - this._player.posX * 32;
        var drawOffsetY = this._canvas.height / 2 - 16 - this._player.posY * 32;
        for (var e in this._entityList) {
            var ent: ClientEntity = this._entityList[e];
            this.drawEntity(ent, drawOffsetX + ent.posX * 32, drawOffsetY + ent.posY * 32);
        };

        // Draw player (always centered)
        if (this._player) {
            this.drawEntity(this._player, this._canvas.width / 2 - 16, this._canvas.height / 2 - 16);
        }
    }
}