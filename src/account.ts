export class Account {
    public id: string;
    public characters: number[];

    public hasCharacter(charID: number): boolean {
        if (this.characters.find((ch) => ch === charID)) {
            return true;
        }
        return false;
    }
}