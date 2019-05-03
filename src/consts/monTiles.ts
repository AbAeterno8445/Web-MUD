interface ImonTiles {
    [key: string]: string
    UNSEEN: string;
    MUMMY_PRIEST: string;
    BOGGART: string;
    DWARF: string;
    GOBLIN: string;
}

export const monTiles: ImonTiles = {
    UNSEEN: "misc/unseen_monster.png",
    MUMMY_PRIEST: "mon/undead/mummy_priest.png",
    BOGGART: "mon/humanoids/boggart.png",
    DWARF: "mon/humanoids/dwarf.png",
    GOBLIN: "mon/humanoids/goblin.png"
};