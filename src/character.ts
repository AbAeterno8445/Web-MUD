import { Entity } from "./entity";
import { MapInstance } from "./map-instance";
import { Item } from "./item";

export class Character extends Entity {
    private _charID: number;
    private _curMap: string;
    private _curInstance: MapInstance;
    private _boundMap: string;
    private _inventory: Item[] = new Array();

    constructor(charID: number, name: string, x: number, y: number, sprite: string) {
        super(name, x, y, sprite);
        this._charID = charID;
        this._boundMap = "huge";
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

    // GET/SET bound map name
    get boundMap(): string { return this._boundMap; }
    set boundMap(m: string) { this._boundMap = m; }

    /** Returns an object with the relevant save-data for the character */
    public getSaveData(): any {
        var attrObj: any = {};
        var attrIgnore = ["_curInstance", "_flags", "_cooldownList"];
        for (var attr in this) {
            if (attrIgnore.includes(attr)) continue;
            attrObj[attr] = this[attr];
        }
        return attrObj;
    }
}