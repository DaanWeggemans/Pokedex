import { Component, inject, OnInit, signal } from '@angular/core';
import { PokemonAbstractionInterface } from '../common/interfaces/pokemon';
import { Client } from '../common/client/client';
import { ImgFallback } from '../common/directives/img-fallback';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [ImgFallback, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  client = inject(Client);

  pokemons = signal<PokemonAbstractionInterface[]>([]);

  async ngOnInit() {
    await this.setPokemon();
  }

  async setPokemon() {
    document.querySelectorAll(".img-failed").forEach(x => x.classList.remove("img-failed"));

    const pokemonsInStorage = this.getPokemons();
    const pokemons: PokemonAbstractionInterface[] = !pokemonsInStorage
      ? await this.client.getPokemons()
      : pokemonsInStorage.pokemons;

    if (!pokemonsInStorage)
      this.storePokemons(pokemons);
    
    this.pokemons.set(pokemons);
  }

  storePokemons(array: PokemonAbstractionInterface[]) {
    const previous_link = localStorage.getItem("previous_link") ?? "";
    const current_link = localStorage.getItem("current_link") ?? "https://pokeapi.co/api/v2/pokemon?offset=0&limit=20";
    const next_link = localStorage.getItem("next_link") ?? "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20";

    const storage = JSON.parse(localStorage.getItem("pokemons") ?? "[]");
    storage.push({ previous_link: previous_link, current_link: current_link, next_link: next_link, pokemons: array });
    localStorage.setItem("pokemons", JSON.stringify(storage));
  }

  getPokemons() {
    const current_link = localStorage.getItem("current_link") ?? "https://pokeapi.co/api/v2/pokemon?offset=0&limit=20";

    const storage = JSON.parse(localStorage.getItem("pokemons") ?? "[]");
    const pokemonsInStorage = storage.find((x: any) => x.current_link == current_link);
    if (!pokemonsInStorage)
      return null;

    localStorage.setItem("previous_link", pokemonsInStorage.previous_link);
    localStorage.setItem("next_link", pokemonsInStorage.next_link);

    return pokemonsInStorage as {
      previous_link: string,
      current_link: string,
      next_link: string,
      pokemons: PokemonAbstractionInterface[]
    };
  }

  // .HTML functions
  async reset() {
    localStorage.removeItem("previous_link");
    localStorage.removeItem("current_link");
    localStorage.removeItem("next_link");

    await this.setPokemon();
  }

  async next() {
    localStorage.setItem("current_link", localStorage.getItem("next_link") ?? "");
    await this.setPokemon();
  }

  async previous() {
    localStorage.setItem("current_link", localStorage.getItem("previous_link") ?? "");
    await this.setPokemon();
  }

  getFromStorage(name: string) {
    return localStorage.getItem(name) ?? "";
  }
}
