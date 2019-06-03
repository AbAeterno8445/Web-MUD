export class Tile {
    /**
     * General tile class used to render map tiles as well as entities.
     */
    private _posX: number;
    private _posY: number;
    private _tileID: string;
    private _flags: string[];
    private _foreTile: string;

    constructor(x: number, y:number, id: string) {
        this._posX = x;
        this._posY = y;
        this._tileID = id;
        this._flags = new Array();
    }

    // GET/SET posX
    get posX(): number { return this._posX; }
    set posX(x: number) { this._posX = x; }

    // GET/SET posY
    get posY(): number { return this._posY; }
    set posY(y: number) { this._posY = y; }

    // GET/SET tileID
    get tileID(): string { return this._tileID; }
    set tileID(id: string) { this._tileID = id; }

    // GET flags
    get flags(): string[] { return this._flags; }

    // GET/SET foreground tile
    get foreTile(): string { return this._foreTile; }
    set foreTile(f: string) { this._foreTile = f; }

    /** Add a flag to the tile */
    public addFlag(f: string): void {
        this._flags.push(f);
    }

    /** Remove a flag from the tile */
    public removeFlag(f: string): void {
        this._flags.splice(this._flags.indexOf(f));
    }

    /** Clears the tile flags */
    public clearFlags(): void {
        this._flags = new Array();
    }

    /** Returns whether the tile has the given flag */
    public hasFlag(f: string): boolean {
        if (this._flags.find((flag) => flag === f)) return true;
        return false;
    }
}