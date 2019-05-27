import { Entity } from "./entity";
import { MapInstance } from "./map-instance";

export class Character extends Entity {
    private _charID: number;
    private _curMap: string;
    private _curInstance: MapInstance;

    constructor(charID: number, name: string, x: number, y: number, sprite: string) {
        super(name, x, y, sprite);
        this._charID = charID;
        this._curMap = "huge";
    }

    // GET/SET charID
    get charID(): number { return this._charID; }
    set charID(cid: number) { this._charID = cid; }

    // GET/SET current map name
    get curMap(): string { return this._curMap; }
    set curMap(m: string) { this._curMap = m; }

    // GET/SET current instance
    get curInstance(): MapInstance { return this._curInstance; }
    set curInstance(inst: MapInstance) { this._curInstance = inst; }
}