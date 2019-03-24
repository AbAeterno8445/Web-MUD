import {Tile} from "./tile"

export class Entity extends Tile {
    private _hp: number;
    private _maxhp: number;

    constructor(x: number, y: number, sprite: number) {
        super(x, y, sprite);
    }

    // GET/SET hp
    get hp(): number { return this._hp; }
    set hp(hp: number) {
        if (hp < this.maxhp) {
            this._hp = hp;
        } else {
            this._hp = this.maxhp;
        }
    }

    // GET/SET maxhp
    get maxhp(): number { return this._maxhp; }
    set maxhp(maxhp: number) { this._maxhp = maxhp; }
}