import { Component, Input } from '@angular/core';
import { PokemonInterface } from '../common/interfaces/pokemon';

@Component({
  selector: 'app-pokemon-detail',
  imports: [],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.css',
})
export class PokemonDetail {
  @Input({ required: true }) pokemon!: PokemonInterface;

  getStat(stat: string) {
    return this.pokemon.stats.find(x => x.name == stat)?.base;
  }
}
