import { dngnTiles } from './../../consts/dngnTiles';
import { EditorMap } from './editorMap';

export class EditorRenderer {
    private _map: EditorMap;
    private _mapTileImages: any = {};

    private _cameraX: number = 0;
    private _cameraY: number = 0;
    private _cameraAutoRender: boolean = true;

    private _canvas: HTMLCanvasElement;
    private _canvasContext: any;

    constructor(canvas: HTMLCanvasElement, canvasW: number, canvasH: number) {
        // Init canvas
        this.setCanvas(canvas, canvasW, canvasH);
    }

    // SET source map
    set map(m: EditorMap) {
        this._map = m;
        this.loadTiles(this._map.mapTileData);
    }

    // GET/SET camera position
    get cameraX(): number { return this._cameraX; }
    set cameraX(x: number) {
        this._cameraX = x;
        if (this._cameraAutoRender && this._map.loaded) {
            this.drawScene();
        }
    }

    get cameraY(): number { return this._cameraY; }
    set cameraY(y: number) {
        this._cameraY = y;
        if (this._cameraAutoRender && this._map.loaded) {
            this.drawScene();
        }
    }

    // GET/SET automatic re-rendering on camera changes
    get cameraAutoRender(): boolean { return this._cameraAutoRender; }
    /** When true, automatically re-renders the scene when the camera position is changed, default true */
    set cameraAutoRender(c: boolean) { this._cameraAutoRender = c; }

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
            } else {
                this._canvasContext.drawImage(tileImg, x, y);
            }
        } else {
            // Trying to draw unloaded image, load then draw it
            this.loadTile(tileID);
            this.drawTile(tileID, x, y);
        }
    }

    public clearCanvas(): void {
        this._canvasContext.clearRect(0, 0, 800, 600);
    }

    /** Draws the map scene into the canvas */
    public drawScene(): void {
        if (!this._map.loaded) return;

        // Clear canvas
        this.clearCanvas();

        // Draw map
        var minX = Math.max(0, Math.floor(-this._cameraX / 32));
        var minY = Math.max(0, Math.floor(-this._cameraY / 32));
        var maxX = Math.min(this._map.width, Math.ceil((this._canvas.width - this._cameraX) / 32));
        var maxY = Math.min(this._map.height, Math.ceil((this._canvas.height - this._cameraY) / 32));

        for (var i = minY; i < maxY; i++) {
            for (var j = minX; j < maxX; j++) {
                var tile = this._map.getTileAt(j, i);
                if (tile) {
                    this.drawTile(tile.tileID, this._cameraX + j * 32, this._cameraY + i * 32);
                }
            }
        }
    }
}