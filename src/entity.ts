import {Tile} from "./tile"

export class Entity extends Tile {
    /** List of cooldowns to tick down */
    private _cooldownList: any = {
        "mvSpeed": 0,       // Movement speed - entity can move when 0
        "attSpeed": 0       // Attack speed - entity can attack when 0
    };

    // Attributes
    private _name: string;
    private _level: number;
    private _hp: number;
    private _maxhp: number;
    private _mvSpeed: number;
    private _attSpeed: number;
    private _dmgPhys: number;

    constructor(name: string, x: number, y: number, sprite: number) {
        super(x, y, sprite);
        this._name = name;
        this._level = 1;
        this._mvSpeed = 0.4;
        this._attSpeed = 0.6;
        this._maxhp = 20;
        this._dmgPhys = 1;
        
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

    // GET/SET movement speed
    get mvSpeed(): number { return this._mvSpeed; }
    set mvSpeed(s: number) { this._mvSpeed = s; }

    // GET/SET attack speed
    get attSpeed(): number { return this._attSpeed; }
    set attSpeed(s: number) { this._attSpeed = s; }

    // GET dmgPhys
    get dmgPhys(): number { return this._dmgPhys; }

    /** Returns the data dictionary for client-side entities    
     * Client-side entities should be structured based on this data */
    public getClientDict(): any {
        var dataDict = {
            drawX: this.drawX,
            drawY: this.drawY,
            tileID: this.tileID,
            hp: this.hp,
            maxhp: this.maxhp
        }
        return dataDict;
    }

    /** Whether entity can move */
    public canMove(): boolean {
        if (this._cooldownList["mvSpeed"] === 0) return true;
        return false;
    }

    /** Reset movement cooldown */
    public moveResetCD(): void {
        this._cooldownList["mvSpeed"] = this._mvSpeed * 60;
    }

    /** Moves the entity in one direction   
     * Receives the tiles moved for each axis   
     * Uses entity cooldown */
    public moveDir(xMov: number, yMov: number): void {
        if (this.canMove()) {
            this.posX += xMov;
            this.posY += yMov;
            this.moveResetCD();
        }
    }

    /** Moves the entity to the given position  
     * Doesn't use movement cooldown */
    public moveTo(x: number, y: number) {
        this.posX = x;
        this.posY = y;
    }

    /** Whether entity can attack */
    public canAttack(): boolean {
        if (this._cooldownList["attSpeed"] === 0) return true;
        return false;
    }

    /** Reset attack cooldown */
    public resetAttackCD(): void {
        this._cooldownList["attSpeed"] = this._attSpeed * 60;
    }
    
    /** Process a tick for the entity */
    public update(): void {
        // Tick cooldowns down
        for (var cd in this._cooldownList) {
            if (this._cooldownList[cd] > 0) this._cooldownList[cd]--;
            if (this._cooldownList[cd] < 0) this._cooldownList[cd] = 0;
        }
    }
}