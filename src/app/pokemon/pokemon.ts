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
  pokemon = signal<PokemonInterface | undefined>(undefined);
  pokemons = signal<PokemonAbstractionInterface[]>([]);

  async ngOnInit() {
    await this.navigate(Number(this.route.snapshot.paramMap.get("id")));
  }

  async navigate(index: number) {
    this.router.navigate(['/pokemon', index]);
    this.id = index;

    if (Number.isNaN(this.id))
      this.router.navigate(["/"]);

    let [storagePokemonsDetail, storagePokemons] = this.getStorage();
    const pokemon = storagePokemonsDetail.find(x => x.index == this.id) != undefined
      ? storagePokemonsDetail.find(x => x.index == this.id)
      : await this.client.getPokemon(this.id);

    if (storagePokemonsDetail.find(x => x.index == this.id) == undefined) {
      if (!pokemon)
        this.router.navigate(["/"]);

      storagePokemons = this.storePokemonsIfNeeded(storagePokemons, pokemon!);
      this.storePokemonsDetailIfNeeded(storagePokemonsDetail, pokemon!);
    }

    this.pokemon.set(pokemon!);
    this.pokemons.set(storagePokemons);

    if (window.innerWidth > 970) {
      setTimeout(() => {
        document.querySelector(".selected")?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 10);
    }
  }

  getStorage(): [PokemonInterface[], PokemonAbstractionInterface[]] {
    return [
      (JSON.parse(localStorage.getItem("pokemons-detail") ?? "[]") as PokemonInterface[])
        .filter(x => x && x.index)
        .sort((a: any, b: any) => a.index - b.index),
      (JSON.parse(localStorage.getItem("pokemons") ?? "[]") as PokemonAbstractionInterface[])
        .filter(x => x && x.index)
        .sort((a: any, b: any) => a.index - b.index)
    ];
  }

  storePokemonsIfNeeded(storage: PokemonAbstractionInterface[], pokemon: PokemonInterface) {
    if (!storage.find(x => x.index == pokemon!.index)) {
      storage.push({ img: pokemon!.img, index: pokemon!.index, name: pokemon!.name } as PokemonAbstractionInterface);
      storage = storage.sort((a: any, b: any) => a.index - b.index);
      localStorage.setItem("pokemons", JSON.stringify(storage));
    }
    return storage;
  }

  storePokemonsDetailIfNeeded(storage: PokemonInterface[], pokemon: PokemonInterface) {
    if (!storage.find(x => x.index == pokemon?.index)) {
      storage.push(pokemon!);
      storage = storage.sort((a: any, b: any) => a.index - b.index);
      localStorage.setItem("pokemons-detail", JSON.stringify(storage));
    }
  }
}
