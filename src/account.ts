export class Account {
    public name: string;
    public password: string;
    public characters: number[];
    public inGame: boolean = false;

    constructor(name: string, password: string) {
        this.name = name;
        this.password = password;
    }

    /** Returns whether account contains given character ID */
    public hasCharacter(charID: number): boolean {
        if (this.characters.find((ch) => ch === charID)) {
            return true;
        }
        return false;
    }

    /** Add a character ID to the account */
    public addCharacter(charID: number): void {
        if (this.hasCharacter(charID)) return;

        this.characters.push(charID);
    }

    /** Remove a character ID from the account */
    public removeCharacter(charID: number): void {
        if (!this.hasCharacter(charID)) return;

        this.characters.splice(this.characters.indexOf(charID));
    }
}