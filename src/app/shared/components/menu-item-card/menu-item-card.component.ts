import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from '../../../models/catalog.models';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  template: `
    <article class="menu-item"><div><span class="menu-tag">{{ item.tag }}</span><h3>{{ item.name }}</h3><p>{{ item.desc }}</p><strong>R$ {{ item.price.toFixed(2).replace('.', ',') }}</strong></div><div class="menu-photo"><img [src]="item.image" [alt]="item.name" loading="lazy"><button type="button" [attr.aria-label]="'Adicionar ' + item.name + ' à sacola'" (click)="add.emit(item)">＋</button></div></article>
  `,
  styleUrl: './menu-item-card.component.css',
})
export class MenuItemCardComponent {
  @Input({ required: true }) item!: MenuItem;
  @Output() add = new EventEmitter<MenuItem>();
}
