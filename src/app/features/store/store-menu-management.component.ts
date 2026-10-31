import { Component, inject, signal } from '@angular/core';
import { NotificationService } from '../../core/notifications/notification.service';
import { MenuCatalogService } from '../../core/catalog/menu-catalog.service';
import { MenuItem } from '../../models/catalog.models';

@Component({
  selector: 'app-store-menu-management',
  standalone: true,
  template: `
    <section class="panel catalog-manager"><div class="panel-heading"><div><div class="eyebrow">VITRINE DO CLIENTE</div><h2>Organize seu cardápio</h2><p>Arraste os itens ou use as setas para mudar a ordem que os clientes veem.</p></div><button class="primary-btn" type="button" (click)="startNewProduct()">＋ Adicionar produto</button></div>
      <div class="catalog-product-list" (dragover)="$event.preventDefault()">
        @for(product of menu.products(); track product.name; let index = $index){
          <article class="catalog-product-row" [class.dragging]="draggedIndex()===index" draggable="true" (dragstart)="draggedIndex.set(index)" (dragend)="draggedIndex.set(null)" (drop)="moveProduct(index)">
            <span class="drag-handle" aria-hidden="true">⠿</span><img [src]="product.image" [alt]="product.name" (error)="useFallback($event)"><div class="catalog-product-info"><b>{{product.name}}</b><small>{{product.desc}}</small><strong>R$ {{product.price.toFixed(2).replace('.', ',')}}</strong></div>
            <div class="catalog-product-actions"><button type="button" class="soft-btn" [disabled]="index===0" (click)="moveProductBy(index,-1)" [attr.aria-label]="'Mover ' + product.name + ' para cima'">↑</button><button type="button" class="soft-btn" [disabled]="index===menu.products().length-1" (click)="moveProductBy(index,1)" [attr.aria-label]="'Mover ' + product.name + ' para baixo'">↓</button><button type="button" class="soft-btn" (click)="startEditProduct(product)">Editar</button><button type="button" class="danger-btn" (click)="confirmDelete(product)">Excluir</button></div>
          </article>
        } @empty {<div class="catalog-empty"><b>Seu cardápio está vazio</b><span>Adicione seu primeiro produto para aparecer na vitrine.</span></div>}
      </div>
    </section>
    @if(editingProduct(); as product){<div class="product-dialog-backdrop" [class.closing]="dialogClosing()" (click)="closeProductDialog()"><section class="product-dialog" [class.closing]="dialogClosing()" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" (click)="$event.stopPropagation()"><button class="dialog-close" type="button" aria-label="Fechar" (click)="closeProductDialog()">×</button><div class="eyebrow">{{product.originalName?'ATUALIZE SEU CARDÁPIO':'NOVO ITEM NA VITRINE'}}</div><h2 id="product-dialog-title">{{product.originalName?'Editar produto':'Adicionar produto'}}</h2><form (submit)="$event.preventDefault(); saveProduct()"><label>Nome do produto<input required maxlength="60" [value]="product.name" (input)="updateDraft('name',$any($event.target).value)"></label><label>Descrição<textarea required maxlength="180" rows="3" [value]="product.desc" (input)="updateDraft('desc',$any($event.target).value)"></textarea></label><div class="product-form-grid"><label>Preço (R$)<input required type="number" min="0.01" step="0.01" [value]="product.price" (input)="updateDraft('price',$any($event.target).value)"></label><label>Imagem do produto<input type="url" placeholder="https://…" [value]="product.image" (input)="updateDraft('image',$any($event.target).value)"></label></div><div class="product-image-preview"><img [src]="product.image || '/images/food-fallback.svg'" [alt]="'Prévia de ' + (product.name || 'novo produto')" (error)="useFallback($event)"><div><b>Prévia da vitrine</b><small>Assim seu produto aparece para os clientes.</small></div></div><label>Categoria / etiqueta<input maxlength="30" [value]="product.tag" (input)="updateDraft('tag',$any($event.target).value)"></label><p class="dialog-caption">Alterações ficam salvas neste navegador até a integração do backend.</p><div class="dialog-actions"><button class="soft-btn" type="button" (click)="closeProductDialog()">Cancelar</button><button class="primary-btn" type="submit">Salvar produto</button></div></form></section></div>}
    @if(productToDelete(); as product){<div class="product-dialog-backdrop" [class.closing]="dialogClosing()" (click)="closeDeleteDialog()"><section class="product-dialog confirm-product-delete" [class.closing]="dialogClosing()" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" (click)="$event.stopPropagation()"><div class="eyebrow">CONFIRME A AÇÃO</div><h2 id="delete-product-title">Remover {{product.name}}?</h2><p>O produto deixará de aparecer no cardápio dos clientes.</p><div class="dialog-actions"><button class="soft-btn" type="button" (click)="closeDeleteDialog()">Manter produto</button><button class="danger-btn" type="button" (click)="deleteProduct()">Remover produto</button></div></section></div>}
    @if(orderSaved()){<div class="product-dialog-backdrop order-saved-backdrop" [class.closing]="dialogClosing()" (click)="closeOrderSavedDialog()"><section class="product-dialog order-saved-dialog" [class.closing]="dialogClosing()" role="dialog" aria-modal="true" aria-labelledby="order-saved-title" (click)="$event.stopPropagation()"><span class="order-saved-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></span><div class="eyebrow">VITRINE ATUALIZADA</div><h2 id="order-saved-title">Ordem do cardápio salva</h2><p>Os produtos já aparecem na nova posição para os clientes.</p><div class="dialog-actions"><button class="primary-btn" type="button" (click)="closeOrderSavedDialog()">Entendi</button></div></section></div>}
  `,
  styleUrl: './store-menu-management.component.css',
})
export class StoreMenuManagementComponent {
  readonly menu = inject(MenuCatalogService);
  private readonly notifications = inject(NotificationService);
  readonly draggedIndex = signal<number | null>(null);
  readonly editingProduct = signal<(MenuItem & { originalName?: string }) | null>(null);
  readonly productToDelete = signal<MenuItem | null>(null);
  readonly orderSaved = signal(false);
  readonly dialogClosing = signal(false);

  startNewProduct(): void { this.dialogClosing.set(false); this.productToDelete.set(null); this.editingProduct.set({ name: '', desc: '', price: 0, image: '', tag: 'NOVO' }); }
  startEditProduct(product: MenuItem): void { this.dialogClosing.set(false); this.productToDelete.set(null); this.editingProduct.set({ ...product, originalName: product.name }); }
  updateDraft(field: 'name'|'desc'|'price'|'image'|'tag', value: string): void { this.editingProduct.update(product => product ? { ...product, [field]: field === 'price' ? Number(value) : value } : null); }

  saveProduct(): void {
    const draft = this.editingProduct();
    if (!draft) return;
    const name = draft.name.trim();
    if (!name || !draft.desc.trim() || !Number.isFinite(draft.price) || draft.price <= 0) { this.notifications.warning('Preencha nome, descrição e um preço válido.'); return; }
    const duplicate = this.menu.products().some(item => item.name.toLocaleLowerCase() === name.toLocaleLowerCase() && item.name !== draft.originalName);
    if (duplicate) { this.notifications.warning('Já existe um produto com esse nome no cardápio.'); return; }
    const product: MenuItem = { name, desc: draft.desc.trim(), price: draft.price, image: draft.image.trim() || '/images/food-fallback.svg', tag: draft.tag.trim() || 'NOVO' };
    const items = [...this.menu.products()];
    const index = draft.originalName ? items.findIndex(item => item.name === draft.originalName) : -1;
    if (index >= 0) items[index] = product; else items.push(product);
    this.menu.save(items);
    this.closeProductDialog();
    this.notifications.success(draft.originalName ? 'Produto atualizado.' : 'Produto adicionado ao cardápio.');
  }

  confirmDelete(product: MenuItem): void { this.dialogClosing.set(false); this.productToDelete.set(product); this.editingProduct.set(null); }
  deleteProduct(): void {
    const product = this.productToDelete();
    if (!product) return;
    this.menu.save(this.menu.products().filter(item => item.name !== product.name));
    this.closeDeleteDialog();
    this.notifications.success('Produto removido do cardápio.');
  }

  closeProductDialog(): void { this.closeWithAnimation(() => this.editingProduct.set(null)); }
  closeDeleteDialog(): void { this.closeWithAnimation(() => this.productToDelete.set(null)); }
  closeOrderSavedDialog(): void { this.closeWithAnimation(() => this.orderSaved.set(false)); }
  private closeWithAnimation(close: () => void): void { if (this.dialogClosing()) return; this.dialogClosing.set(true); window.setTimeout(() => { close(); this.dialogClosing.set(false); }, 180); }
  moveProduct(index: number): void { const from = this.draggedIndex(); if (from === null || from === index) return; this.reorder(from, index); this.draggedIndex.set(null); }
  moveProductBy(index: number, delta: number): void { this.reorder(index, index + delta); }
  private reorder(from: number, to: number): void {
    const items = [...this.menu.products()];
    if (to < 0 || to >= items.length) return;
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    this.menu.save(items);
    this.dialogClosing.set(false);
    this.orderSaved.set(true);
  }
  useFallback(event: Event): void { (event.target as HTMLImageElement).src = '/images/food-fallback.svg'; }
}
