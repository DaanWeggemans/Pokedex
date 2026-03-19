import { Component, inject, OnInit, signal } from '@angular/core';
import { PokemonInterface } from '../common/interfaces/pokemon';
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

  pokemons = signal<PokemonInterface[]>([]);

  async ngOnInit() {
    await this.setPokemon();
  }

  async setPokemon() {
    document.querySelectorAll(".pokemon .image").forEach(x => x.firstElementChild?.classList.remove("img-failed"));
    const storage: PokemonInterface[] = JSON.parse(localStorage.getItem("pokemons") ?? "[]");
    const [from, to] = this.getRanges() as [number, number];

    const pokemonsInStorage = storage.filter(x => {
      if (from == 1021)
        return x.index >= from && x.index <= 10015;
      if (from > 1021)
        return x.index >= from + 8976 && x.index <= to + 8976;
      return (x.index >= from && x.index <= to);
    });

    let pokemons: PokemonInterface[] = [];
    if (pokemonsInStorage.length != to - from + 1) {
      pokemons = await this.client.getPokemonsInRange(from, to);
      storage.push(...pokemons.filter(x => !storage.map(x => x.index).includes(x.index)));
      localStorage.setItem("pokemons", JSON.stringify(storage));
    } else {
      pokemons = pokemonsInStorage;
    }
    
    this.pokemons.set(pokemons);
  }

  async reset() {
    localStorage.removeItem("from");
    localStorage.removeItem("to");

    await this.setPokemon();
  }

  async setStep(step: number) {
    const [from, to] = this.getRanges() as [number, number];

    localStorage.setItem("from", String(from + step));
    localStorage.setItem("to", String(to + step));

    await this.setPokemon();
  }

  private getRanges(key: string | undefined = undefined): [number, number] | number {
    const from = Number(localStorage.getItem("from") ?? "1");
    const to = Number(localStorage.getItem("to") ?? "20");
    return key && ["from", "to"].includes(key) ? (key == "from" ? from : to) : [from, to];
  }

  getRange(key: string) {
    return this.getRanges(key) as number;
  }
}
