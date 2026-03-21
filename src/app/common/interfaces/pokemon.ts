export interface PokemonAbstractionInterface {
    img: string;
    name: string;
    index: number;
}

export interface PokemonAbilityInterface {
    name: string;
    isHidden: boolean;
}

export interface PokemonStatInterface {
    base: number;
    name: string;
}

export interface PokemonTypeInterface {
    name: string;
}

export interface PokemonInterface extends PokemonAbstractionInterface {
    abilities: PokemonAbilityInterface[];
    stats: PokemonStatInterface[];
    types: PokemonTypeInterface[];
}