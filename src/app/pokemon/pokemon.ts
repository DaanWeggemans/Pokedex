import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../common/client/client';
import { PokemonAbstractionInterface, PokemonInterface } from '../common/interfaces/pokemon';

@Component({
  selector: 'app-pokemon',
  imports: [],
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
    this.id = Number(this.route.snapshot.paramMap.get("id"));

    if (Number.isNaN(this.id))
      this.router.navigate(["/"]);

    const pokemon = await this.client.getPokemon(this.id);
    if (!pokemon)
      this.router.navigate(["/"]);

    const storage = JSON.parse(localStorage.getItem("pokemons") ?? "[]") as PokemonAbstractionInterface[];
    if (!storage.find(x => x.index == pokemon?.index))
      storage.push({ img: pokemon?.img, index: pokemon?.index, name: pokemon?.name } as PokemonAbstractionInterface);
    
    console.log(pokemon);
    this.pokemon.set(pokemon!);
    this.pokemons.set(storage.sort((a: any, b: any) => a.index > b.index ? 1 : (a.index < a.index ? -1 : 0)));
  }
}
