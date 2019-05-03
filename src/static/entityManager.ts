import {ClientEntity} from './clientEntity';
import {monTiles} from './../consts/monTiles';

const defaultEntTile = monTiles.UNSEEN;

export class EntityManager {
    private _entImages: any = {};
    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;
    private _entityList: any = {};
    private _mainPlayer: ClientEntity = new ClientEntity(0, 0, defaultEntTile);  // Main player

    constructor(canvas: HTMLCanvasElement, canvasW: number, canvasH: number) {
        // Init canvas
        this.setCanvas(canvas, canvasW, canvasH);
    }

    // GET main player
    get mainPlayer(): ClientEntity { return this._mainPlayer; }

    /** Set canvas and its size */
    public setCanvas(canvas: HTMLCanvasElement, canvasW: number, canvasH: number): void {
        this._canvas = canvas;
        this._canvas.width = canvasW;
        this._canvas.height = canvasH;
        this._canvasContext = canvas.getContext('2d');
    }

    /** Draws an entity at a given position */
    public drawEntity(entID: string, x: number, y: number): void {
        var entImg = this._entImages[entID];
        if (entImg) {
            this._canvasContext.drawImage(entImg, x, y);
        }
    }

    /** Creates an entity using a dictionary with relevant data     
     *  Dictionary based on server entity's getClientDict() function */
    public newEntity(entDict: any): void {
        var entTile = entDict.tileID;
        var newEnt = new ClientEntity(entDict.posX, entDict.posY, entTile);
        this._entityList[entDict.id] = newEnt;
        this.loadEntityImage(newEnt);
        this.drawEntities();
    }

    /** Load an entity's image */
    public loadEntityImage(ent: ClientEntity) {
        var entImg = ent.tileID;
        if (entImg in this._entImages == false) {
            this._entImages[entImg] = new Image();
            this._entImages[entImg].src = "assets/sprites/" + monTiles[entImg];
        }
    }

    /** Sets an entity's data from a given dictionary */
    public setEntityData(id: any, entDict: any) {
        if (id === -1) {
            this._mainPlayer.setData(entDict);
            this.loadEntityImage(this._mainPlayer);
        } else if (this._entityList[id]) {
            this._entityList[id].setData(entDict);
            this.loadEntityImage(this._entityList[id]);
        }
        this.drawEntities();
    }

    /** Removes an existing entity */
    public removeEntity(id: any): void {
        if (this._entityList[id]) {
            delete this._entityList[id];
        }
        this.drawEntities();
    }

    /** Change an entity's tile, use id -1 for main player */
    public setEntityTile(id: number, tile: string): void {
        if (id === -1) {
            this._mainPlayer.tileID = tile;
            this.loadEntityImage(this._mainPlayer);
        } else if (this._entityList[id]) {
            this._entityList[id].tileID = tile;
            this.loadEntityImage(this._entityList[id]);
        }
        this.drawEntities();
    }

    /** Moves an entity to the given position */
    public moveEntity(id: number, x: number, y: number) {
        if (id === -1) {
            this._mainPlayer.moveTo(x, y);
        } else if (this._entityList[id]) {
            this._entityList[id].moveTo(x, y);
        }
        this.drawEntities();
    }

    /** Draw the entities into the canvas */
    public drawEntities() {
        // Clear canvas
        this._canvasContext.clearRect(0, 0, 800, 600);

        var drawOffsetX = this._canvas.width / 2 - 16 - this._mainPlayer.posX * 32;
        var drawOffsetY = this._canvas.height / 2 - 16 - this._mainPlayer.posY * 32;
        for (var e in this._entityList) {
            var ent: ClientEntity = this._entityList[e];
            if (ent) {
                this.drawEntity(ent.tileID, drawOffsetX + ent.posX * 32, drawOffsetY + ent.posY * 32);
            }
        };

        // Draw player (always centered)
        if (this._mainPlayer) {
            this.drawEntity(this._mainPlayer.tileID, this._canvas.width / 2 - 16, this._canvas.height / 2 - 16);
        }
    }
}