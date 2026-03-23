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
    const storage: PokemonAbstractionInterface[] = JSON.parse(localStorage.getItem("pokemons") ?? "[]");
    const [from, to] = this.getRanges() as [number, number];

    const pokemonsInStorage = storage.filter(x => x.index >= from && x.index <= to);
    const pokemons: PokemonAbstractionInterface[] = pokemonsInStorage.length != to - from + 1
      ? await this.client.getPokemonsInRange(from, to)
      : pokemonsInStorage;

    if (pokemonsInStorage.length != to - from + 1) {
      storage.push(...pokemons.filter(x => !storage.map(x => x.index).includes(x.index)));
      localStorage.setItem("pokemons", JSON.stringify(storage));
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
