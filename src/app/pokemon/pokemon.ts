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

    const pokemon = await this.client.getPokemon(this.id);
    if (!pokemon)
      this.router.navigate(["/"]);

    const storage = JSON.parse(localStorage.getItem("pokemons") ?? "[]") as PokemonAbstractionInterface[];
    if (!storage.find(x => x.index == pokemon?.index)) {
      storage.push({ img: pokemon?.img, index: pokemon?.index, name: pokemon?.name } as PokemonAbstractionInterface);
      localStorage.setItem("pokemons", JSON.stringify(storage));
    }
    
    console.log(pokemon);
    this.pokemon.set(pokemon!);
    this.pokemons.set(storage.sort((a: any, b: any) => a.index - b.index));

    setTimeout(() => {
      document.querySelector(".selected")?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 10);
  }
}
