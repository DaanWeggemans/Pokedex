import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable, InjectionToken } from "@angular/core";
import { catchError, firstValueFrom, mergeMap, of } from "rxjs";
import { PokemonAbilityInterface, PokemonAbstractionInterface, PokemonInterface, PokemonStatInterface, PokemonTypeInterface } from "../interfaces/pokemon";

export const API_BASE_URL = new InjectionToken<string>("");

@Injectable({ providedIn: 'root' })
export class Client {
  baseUrl = inject(API_BASE_URL);
  http = inject(HttpClient);

  async getPokemonsInRange(from: number, to: number) {
    const url = `${this.baseUrl}/pokemon-species`;
    const options: any = {
      responseType: 'json',
      params: new HttpParams()
        .set("offset", from - 1)
        .set("limit", to - from + 1)
    };

    const response$ = this.http.get(url, options)
      .pipe(
        mergeMap((response: any) => {
          const result: PokemonAbstractionInterface[] = (response.results?.map((pokemon: any) => {
            const index = Number(pokemon.url.substring(pokemon.url.indexOf("pokemon")).split("/")[1] ?? "10000");
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
          const index = Number(response.species.url.substring(response.species.url.indexOf("pokemon-species")).split("/")[1] ?? "10000");
          const name = response.species.name ?? "";
          const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;

          const result: PokemonInterface = {
            img: img,
            name: name.substring(0, 1).toUpperCase() + name.substring(1),
            index: index,
            abilities: response.abilities.map((ability: any) => {
              return { name: ability.ability.name, isHidden: ability.is_hidden } as PokemonAbilityInterface;
            }),
            stats: response.stats.map((stat: any) => {
              return { base: stat.base_stat, name: stat.stat.name } as PokemonStatInterface;
            }),
            types: response.types.map((type: any) => {
              return { name: type.type.name } as PokemonTypeInterface;
            })
          };

          return of(result);
        }),
        catchError((error: any) => of(null))
      );

		return await firstValueFrom(response$);
  }
}
