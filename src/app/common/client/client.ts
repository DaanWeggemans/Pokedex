import { HttpClient } from "@angular/common/http";
import { inject, Injectable, InjectionToken } from "@angular/core";
import { catchError, firstValueFrom, mergeMap, of } from "rxjs";
import { PokemonAbilityInterface, PokemonAbstractionInterface, PokemonInterface, PokemonStatInterface, PokemonTypeInterface } from "../interfaces/pokemon";

export const API_BASE_URL = new InjectionToken<string>("");

@Injectable({ providedIn: 'root' })
export class Client {
  baseUrl = inject(API_BASE_URL);
  http = inject(HttpClient);

  async getPokemons() {
    const url = localStorage.getItem("current_link") ?? `${this.baseUrl}/pokemon`;
    const options: any = {
      responseType: 'json',
    };

    const response$ = this.http.get(url, options)
      .pipe(
        mergeMap((response: any) => {
          localStorage.setItem("previous_link", response.previous ?? "");
          localStorage.setItem("next_link", response.next ?? "");

          const result: PokemonAbstractionInterface[] = (response.results?.map((pokemon: any) => {
            const index = Number(pokemon.url.substring(pokemon.url.indexOf("pokemon")).split("/")[1]) || 10000;
            const name = pokemon.name ?? "";
            const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;

            return {
              img: img,
              name: name.substring(0, 1).toUpperCase() + name.substring(1),
              index: index
            };
          }) ?? []).filter((pokemon: PokemonAbstractionInterface) => pokemon.index < 10000);;

          return of(result);
        }),
        catchError((error: any) => of([]))
      );

		return await firstValueFrom(response$);
  }

  async getPokemon(id: number) {
    const url = `${this.baseUrl}/pokemon/${id}`;
    const options: any = {
      responseType: 'json'
    };

    const response$ = this.http.get(url, options)
      .pipe(
        mergeMap((response: any) => {
          const index = Number(response.species.url.substring(response.species.url.indexOf("pokemon-species")).split("/")[1]) || 10000;
          const name = response.species.name ?? "";
          const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;

          const storage = JSON.parse(localStorage.getItem("pokemons-detail") ?? "[]") as PokemonInterface[];
          const evolution = storage.find(x => x.evolution?.some(y => y.some(z => z.index == index)))?.evolution;

          console.log(storage, evolution);
          
          const result: PokemonInterface = {
            img: img,
            name: name.substring(0, 1).toUpperCase() + name.substring(1),
            index: index,
            evolution: evolution ? evolution : undefined,
            abilities: response.abilities.map((ability: any) => {
              return {
                name: ability.ability.name.replace(/[- ].|^./g, (letter: string) => letter.replaceAll("-", " ").toUpperCase()),
                isHidden: ability.is_hidden
              } as PokemonAbilityInterface;
            }),
            stats: response.stats.map((stat: any) => {
              return {
                base: stat.base_stat,
                name: stat.stat.name
              } as PokemonStatInterface;
            }),
            types: response.types.map((type: any) => {
              const index = Number(type.type.url.substring(type.type.url.indexOf("type")).split("/")[1]) || 1;
              const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl/${index}.png`;
              return {
                name: type.type.name,
                img: img
              } as PokemonTypeInterface;
            })
          };

          return of(result);
        }),
        catchError((error: any) => of(null))
      );

		return await firstValueFrom(response$);
  }

  async getEvolutionChain(id: number) {
    const url = `${this.baseUrl}/pokemon-species/${id}`;
    const options: any = {
      responseType: 'json'
    };
    
    const response$ = this.http.get(url, options)
      .pipe(
        mergeMap((response: any) => {
          return this.http.get(response.evolution_chain.url, options)
            .pipe(
              mergeMap((response: any) => {
                const result: PokemonAbstractionInterface[][] = [];
                let chain = [response.chain];

                do {
                  const array: PokemonAbstractionInterface[] = [];
                  chain.forEach((pokemon: any) => {
                    const index = Number(pokemon.species.url.substring(pokemon.species.url.indexOf("pokemon-species")).split("/")[1]) || 10000;
                    const name = pokemon.species.name ?? "";
                    const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;

                    array.push({
                      img: img,
                      name: name.substring(0, 1).toUpperCase() + name.substring(1),
                      index: index
                    });
                  });

                  result.push(array);
                  chain = chain[0].evolves_to;
                } while (Array.isArray(chain) && (chain as any[]).length);

                return of(result);
              }),
              catchError((error: any) => of([]))
            );
        }),
        catchError((error: any) => of([]))
      );

		return await firstValueFrom(response$) as PokemonInterface[][];
  }
}
