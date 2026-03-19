import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonInterface } from '../common/interfaces/pokemon';
import { Client } from '../common/client/client';

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
  pokemon = signal<any>(undefined);

  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get("id"));

    if (Number.isNaN(this.id))
      this.router.navigate(["/"]);

    this.pokemon.set(await this.client.getPokemon(this.id));
  }
}
