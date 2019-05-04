import {ClientEntity} from './clientEntity';
import {monTiles} from './../consts/monTiles';
import { MapManager } from './mapManager';

export class EntityManager {
    private _entImages: any = {};
    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;
    private _entityList: any = {};
    private _mainPlayer: ClientEntity = new ClientEntity();  // Main player

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

    /** Creates an entity using a dictionary with relevant data     
     *  Dictionary based on server entity's getClientDict() function */
    public newEntity(entDict: any): void {
        var newEnt = new ClientEntity();
        newEnt.setData(entDict);
        this._entityList[entDict.id] = newEnt;
        this.loadEntityImage(newEnt);
    }

    /** Load an entity's image */
    public loadEntityImage(ent: ClientEntity) {
        var entImg = ent.tileID;
        if (entImg in this._entImages == false) {
            var newEntImg = new Image();
            newEntImg.setAttribute('loaded', '0');
            newEntImg.onload = function() {
                newEntImg.setAttribute('loaded', '1');
            };
            newEntImg.src = "assets/sprites/" + monTiles[entImg];
            this._entImages[entImg] = newEntImg;
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
    }

    /** Removes an existing entity */
    public removeEntity(id: any): void {
        if (this._entityList[id]) {
            delete this._entityList[id];
        }
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
    }

    /** Moves an entity to the given position */
    public moveEntity(id: number, x: number, y: number) {
        if (id === -1) {
            this._mainPlayer.moveTo(x, y);
        } else if (this._entityList[id]) {
            this._entityList[id].moveTo(x, y);
        }
    }

    /** Draws an entity at a given position */
    public drawEntity(ent: ClientEntity, x: number, y: number): void {
        var entImg = this._entImages[ent.tileID];
        if (entImg) {
            // Postpone drawing if not loaded
            if (entImg.getAttribute('loaded') === '0') {
                setTimeout(() => {
                    this.drawEntity(ent, x, y);
                }, 100);
                return;
            }
            
            this._canvasContext.drawImage(entImg, x, y - (entImg.height - 32));
            if (ent.hp >= 0 && ent.hp < ent.maxhp) {
                var perc = ent.hp / ent.maxhp;
                var red = 0;
                var green = 255;
                if (perc < 0.67) {
                    if (perc > 0.33) {
                        red = 255;
                    } else {
                        red = 255;
                        green = 0;
                    }
                }

                this._canvasContext.lineWidth = 2;
                this._canvasContext.strokeStyle = "rgb(" + red.toString() + "," + green.toString() + ",0)";
                this._canvasContext.beginPath();
                this._canvasContext.moveTo(x, y + 32);
                this._canvasContext.lineTo(x + Math.max(1, Math.floor(entImg.width * perc)), y + 32);
                this._canvasContext.stroke();
            }
        }
    }

    /** Draw the entities into the canvas */
    public drawEntities(mapManager: MapManager) {
        // Clear canvas
        this._canvasContext.clearRect(0, 0, 800, 600);

        var drawOffsetX = this._canvas.width / 2 - 16 - this._mainPlayer.posX * 32;
        var drawOffsetY = this._canvas.height / 2 - 16 - this._mainPlayer.posY * 32;
        for (var e in this._entityList) {
            var ent: ClientEntity = this._entityList[e];
            if (ent) {
                var entTile = mapManager.getTileAt(ent.posX, ent.posY);
                if (entTile.visible) {
                    this.drawEntity(ent, drawOffsetX + ent.posX * 32, drawOffsetY + ent.posY * 32);
                }
            }
        };

        // Draw player (always centered)
        if (this._mainPlayer) {
            this.drawEntity(this._mainPlayer, this._canvas.width / 2 - 16, this._canvas.height / 2 - 16);
        }
    }
}