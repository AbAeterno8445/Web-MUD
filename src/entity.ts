import {Tile} from "./tile"

export class Entity extends Tile {
    private _name: string;
    private _level: number;
    private _hp: number;
    private _maxhp: number;
    private _dmgPhys: number;

    constructor(name: string, x: number, y: number, sprite: number) {
        super(x, y, sprite);
        this._name = name;
        this._level = 1;
        this._dmgPhys = 1;
        this._maxhp = 20;
        
        this.hp = this.maxhp;
    }

    // GET/SET name
    get name(): string { return this._name; }
    set name(name: string) { this._name = name; }

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

    // GET level
    get level(): number { return this._level; }

    // GET dmgPhys
    get dmgPhys(): number { return this._dmgPhys; }
}