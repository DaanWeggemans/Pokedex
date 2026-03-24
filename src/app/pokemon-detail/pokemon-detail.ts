import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PokemonInterface } from '../common/interfaces/pokemon';

@Component({
  selector: 'app-pokemon-detail',
  imports: [],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.css',
})
export class PokemonDetail {
  @Output() retrieveEvolution = new EventEmitter<void>;
  @Output() clickEvolution = new EventEmitter<number>;
  @Input({ required: true }) pokemon!: PokemonInterface;
  @Input({ required: true }) isToggledEvolution!: boolean;

  getStat(stat: string) {
    return this.pokemon.stats.find(x => x.name == stat)?.base;
  }

  toggleEvolution() {
    this.retrieveEvolution.emit();
  }

  selectEvolution(index: number) {
    this.clickEvolution.emit(index);
  }
}
