import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Client } from '../common/client/client';
import { PokemonAbstractionInterface, PokemonInterface } from '../common/interfaces/pokemon';
import { PokemonDetail } from '../pokemon-detail/pokemon-detail';

@Component({
  selector: 'app-pokemon',
  imports: [PokemonDetail, RouterLink],
  templateUrl: './pokemon.html',
  styleUrl: './pokemon.css',
})
export class Pokemon implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  client = inject(Client);

  id!: number;
  isEvolutionToggled!: boolean;
  pokemon = signal<PokemonInterface | undefined>(undefined);
  pokemons = signal<PokemonAbstractionInterface[]>([]);

  async ngOnInit() {
    await this.navigate(Number(this.route.snapshot.paramMap.get("id")));
  }

  async navigate(index: number, disableEvolutions: boolean = true) {
    if (this.id == index)
      return;
    
    this.router.navigate(['/pokemon', index]);
    if (disableEvolutions)
      this.isEvolutionToggled = false;
    this.id = index;

    if (Number.isNaN(this.id))
      this.router.navigate(["/"]);

    const [storagePokemonsDetail, storagePokemons] = this.getStorage();
    const pokemon = storagePokemonsDetail.find(x => x.index == this.id) != undefined
      ? storagePokemonsDetail.find(x => x.index == this.id)
      : await this.client.getPokemon(this.id);

    if (storagePokemonsDetail.find(x => x.index == this.id) == undefined) {
      this.isEvolutionToggled = false;
      if (!pokemon)
        this.router.navigate(["/"]);

      if (storagePokemons.find(x => x.index == pokemon?.index) == undefined)
        storagePokemons.push(pokemon!);
      this.storePokemonsDetailIfNeeded(storagePokemonsDetail, pokemon!);
    }

    this.pokemon.set(pokemon!);
    this.pokemons.set(storagePokemons.sort((a: any, b: any) => a.index - b.index));

    if (window.innerWidth > 970) {
      setTimeout(() => {
        document.querySelector(".selected")?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 10);
    }
  }

  async retrieveEvolution() {
    this.isEvolutionToggled = !this.isEvolutionToggled;
    if (!this.isEvolutionToggled)
      return;

    const [array, _] = this.getStorage();
    const pokemon = array.find(x => x.index == this.id);
    if (!pokemon || pokemon.evolution)
      return;

    const possibility = array.find(x => x.evolution?.some(y => y.some(z => z.index == pokemon.index)))?.evolution;
    const evolution = possibility ? possibility : await this.client.getEvolutionChain(this.id);
    if (!pokemon || !evolution.length)
      return;

    pokemon.evolution = evolution;
    this.pokemon.set(pokemon);
    this.storePokemonsDetailIfNeeded(array);
  }

  getStorage(): [PokemonInterface[], PokemonAbstractionInterface[]] {
    return [
      (JSON.parse(localStorage.getItem("pokemons-detail") ?? "[]") as PokemonInterface[])
        .filter(x => x && x.index)
        .sort((a: any, b: any) => a.index - b.index),
      (JSON.parse(localStorage.getItem("pokemons") ?? "[]") as {
        previous_link: string,
        current_link: string,
        next_link: string,
        pokemons: PokemonAbstractionInterface[]
      }[]).flatMap(x => x.pokemons)
        .filter(x => x && x.index)
        .sort((a: any, b: any) => a.index - b.index)
    ];
  }

  storePokemonsDetailIfNeeded(storage: PokemonInterface[], pokemon: PokemonInterface| undefined = undefined) {
    if (!pokemon || !storage.find(x => x.index == pokemon?.index)) {
      if (pokemon)
        storage.push(pokemon!);
      storage = storage.sort((a: any, b: any) => a.index - b.index);
      localStorage.setItem("pokemons-detail", JSON.stringify(storage));
    }
  }
}
