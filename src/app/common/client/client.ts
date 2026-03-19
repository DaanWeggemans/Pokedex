import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable, InjectionToken } from "@angular/core";
import { firstValueFrom, mergeMap, of } from "rxjs";
import { PokemonInterface } from "../interfaces/pokemon";

export const API_BASE_URL = new InjectionToken<string>("");

@Injectable({ providedIn: 'root' })
export class Client {
  baseUrl = inject(API_BASE_URL);
  http = inject(HttpClient);

  async getPokemonsInRange(from: number, to: number) {
    const url = `${this.baseUrl}/pokemon`;
    const options: any = {
      responseType: 'json',
      params: new HttpParams()
        .set("offset", from - 1)
        .set("limit", to - from + 1)
    };

    const response$ = this.http.get(url, options)
      .pipe(
        mergeMap((response: any) => {
          const result: PokemonInterface[] = response.results?.map((pokemon: any) => {
            const index = Number(pokemon.url.substring(pokemon.url.indexOf("pokemon")).split("/")[1] ?? "0");
            const name = pokemon.name ?? "";
            const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;

            return {
              img: img,
              name: name.substring(0, 1).toUpperCase() + name.substring(1),
              index: index
            };
          }) ?? [];

          return of(result);
        })
      );

		return await firstValueFrom(response$);
  }

  async getPokemon(id: number) {
    const url = `${this.baseUrl}/pokemon/${id}`;
    const options: any = {
      responseType: 'json'
    };

    const response$ = this.http.get(url, options);

		return await firstValueFrom(response$);
  }
}
