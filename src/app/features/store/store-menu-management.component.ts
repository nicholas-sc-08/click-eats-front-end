import { Component, inject, signal } from '@angular/core';
import { MenuCatalogService } from '../../core/catalog/menu-catalog.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { MenuItem } from '../../models/catalog.models';

type ProductDraft = MenuItem & { originalName?: string };

@Component({
  selector: 'app-store-menu-management',
  standalone: true,
  template: `
    <section class="panel catalog-manager" aria-labelledby="catalog-manager-title">
      <header class="catalog-heading">
        <div>
          <div class="eyebrow">VITRINE DO CLIENTE</div>
          <h2 id="catalog-manager-title">Organize seu cardápio</h2>
          <p>Arraste os itens ou use as setas para escolher a ordem que os clientes veem.</p>
        </div>
        <button class="primary-btn add-product-button" type="button" (click)="startNewProduct()">
          <span aria-hidden="true">＋</span> Adicionar produto
        </button>
      </header>

      <div class="catalog-product-list" (dragover)="$event.preventDefault()">
        @for (product of menu.products(); track product.name; let index = $index) {
          <article
            class="catalog-product-row"
            [attr.data-product-name]="product.name"
            [class.dragging]="draggedIndex() === index"
            (dragover)="$event.preventDefault()"
            (drop)="moveProduct(index)"
          >
            <span
              class="drag-handle"
              aria-label="Arrastar para reordenar"
              title="Arraste para reordenar"
              draggable="true"
              (dragstart)="draggedIndex.set(index)"
              (dragend)="draggedIndex.set(null)"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="7" cy="5" r="1"/><circle cx="13" cy="5" r="1"/><circle cx="7" cy="10" r="1"/><circle cx="13" cy="10" r="1"/><circle cx="7" cy="15" r="1"/><circle cx="13" cy="15" r="1"/></svg>
            </span>

            <img [src]="product.image" [alt]="product.name" (error)="useFallback($event)">

            <div class="catalog-product-info">
              <b>{{ product.name }}</b>
              <small>{{ product.desc }}</small>
              <strong>R$ {{ product.price.toFixed(2).replace('.', ',') }}</strong>
            </div>

            <div class="catalog-product-actions" [attr.aria-label]="'Ações para ' + product.name">
              <div class="reorder-actions" aria-label="Reordenar produto">
                <button
                  class="icon-action"
                  type="button"
                  [disabled]="index === 0"
                  [attr.aria-label]="'Mover ' + product.name + ' para cima'"
                  title="Mover para cima"
                  (click)="moveProductBy(index, -1)"
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 12 5-5 5 5"/></svg>
                </button>
                <button
                  class="icon-action"
                  type="button"
                  [disabled]="index === menu.products().length - 1"
                  [attr.aria-label]="'Mover ' + product.name + ' para baixo'"
                  title="Mover para baixo"
                  (click)="moveProductBy(index, 1)"
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>
                </button>
              </div>
              <button class="soft-btn edit-product-button" type="button" (click)="startEditProduct(product)">Editar</button>
              <button class="danger-btn delete-product-button" type="button" (click)="confirmDelete(product)">Excluir</button>
            </div>
          </article>
        } @empty {
          <div class="catalog-empty">
            <b>Seu cardápio está vazio</b>
            <span>Adicione seu primeiro produto para aparecer na vitrine.</span>
          </div>
        }
      </div>
    </section>

    @if (editingProduct(); as product) {
      <div class="product-dialog-backdrop" [class.closing]="dialogClosing()" (click)="closeProductDialog()">
        <section
          class="product-dialog"
          [class.closing]="dialogClosing()"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-dialog-title"
          (click)="$event.stopPropagation()"
        >
          <header class="dialog-header">
            <span class="dialog-icon product-dialog-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </span>
            <button class="dialog-close" type="button" aria-label="Fechar" (click)="closeProductDialog()">×</button>
            <div class="eyebrow">{{ product.originalName ? 'ATUALIZE SEU CARDÁPIO' : 'NOVO ITEM NA VITRINE' }}</div>
            <h2 id="product-dialog-title">{{ product.originalName ? 'Editar produto' : 'Adicionar produto' }}</h2>
            <p>Preencha os detalhes que seus clientes verão na vitrine.</p>
          </header>

          <form class="product-form" (submit)="$event.preventDefault(); saveProduct()">
            <label class="form-field">
              <span>Nome do produto</span>
              <input required maxlength="60" [value]="product.name" (input)="updateDraft('name', $any($event.target).value)">
            </label>

            <label class="form-field">
              <span>Descrição</span>
              <textarea required maxlength="180" rows="3" [value]="product.desc" (input)="updateDraft('desc', $any($event.target).value)"></textarea>
            </label>

            <div class="product-form-grid">
              <label class="form-field">
                <span>Preço (R$)</span>
                <input required type="number" min="0.01" step="0.01" [value]="product.price" (input)="updateDraft('price', $any($event.target).value)">
              </label>
              <label class="form-field">
                <span>URL da imagem</span>
                <input type="url" placeholder="https://…" [value]="product.image" (input)="updateDraft('image', $any($event.target).value)">
              </label>
            </div>

            <div class="product-image-preview">
              <img [src]="product.image || '/images/food-fallback.svg'" [alt]="'Prévia de ' + (product.name || 'novo produto')" (error)="useFallback($event)">
              <div><b>Prévia da vitrine</b><small>A imagem será exibida junto com o produto.</small></div>
            </div>

            <label class="form-field">
              <span>Categoria / etiqueta</span>
              <input maxlength="30" [value]="product.tag" (input)="updateDraft('tag', $any($event.target).value)">
            </label>

            <p class="dialog-caption">As alterações ficam salvas neste navegador até a integração do backend.</p>
            <footer class="dialog-actions">
              <button class="soft-btn" type="button" (click)="closeProductDialog()">Cancelar</button>
              <button class="primary-btn" type="submit">{{ product.originalName ? 'Salvar alterações' : 'Adicionar produto' }}</button>
            </footer>
          </form>
        </section>
      </div>
    }

    @if (productToDelete(); as product) {
      <div class="product-dialog-backdrop delete-dialog-backdrop" [class.closing]="dialogClosing()" (click)="closeDeleteDialog()">
        <section
          class="product-dialog delete-dialog"
          [class.closing]="dialogClosing()"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
          aria-describedby="delete-product-description"
          (click)="$event.stopPropagation()"
        >
          <button class="dialog-close" type="button" aria-label="Fechar" (click)="closeDeleteDialog()">×</button>
          <span class="dialog-icon delete-dialog-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
          </span>
          <div class="eyebrow">REMOÇÃO DE PRODUTO</div>
          <h2 id="delete-product-title">Excluir este produto?</h2>
          <p id="delete-product-description" class="delete-description">
            <strong>{{ product.name }}</strong> deixará de aparecer no cardápio dos clientes. Essa ação não pode ser desfeita.
          </p>
          <div class="delete-product-summary">
            <img [src]="product.image" [alt]="''" (error)="useFallback($event)">
            <div><b>{{ product.name }}</b><small>R$ {{ product.price.toFixed(2).replace('.', ',') }}</small></div>
          </div>
          <footer class="dialog-actions">
            <button class="soft-btn" type="button" (click)="closeDeleteDialog()">Manter produto</button>
            <button class="danger-btn confirm-delete-button" type="button" (click)="deleteProduct()">Excluir produto</button>
          </footer>
        </section>
      </div>
    }
  `,
  styleUrl: './store-menu-management.component.css',
})
export class StoreMenuManagementComponent {
  readonly menu = inject(MenuCatalogService);
  private readonly notifications = inject(NotificationService);

  readonly draggedIndex = signal<number | null>(null);
  readonly editingProduct = signal<ProductDraft | null>(null);
  readonly productToDelete = signal<MenuItem | null>(null);
  readonly dialogClosing = signal(false);

  startNewProduct(): void {
    this.dialogClosing.set(false);
    this.productToDelete.set(null);
    this.editingProduct.set({ name: '', desc: '', price: 0, image: '', tag: 'NOVO' });
  }

  startEditProduct(product: MenuItem): void {
    this.dialogClosing.set(false);
    this.productToDelete.set(null);
    this.editingProduct.set({ ...product, originalName: product.name });
  }

  updateDraft(field: 'name' | 'desc' | 'price' | 'image' | 'tag', value: string): void {
    this.editingProduct.update(product => product
      ? { ...product, [field]: field === 'price' ? Number(value) : value }
      : null);
  }

  saveProduct(): void {
    const draft = this.editingProduct();
    if (!draft) return;

    const name = draft.name.trim();
    if (!name || !draft.desc.trim() || !Number.isFinite(draft.price) || draft.price <= 0) {
      this.notifications.warning('Preencha nome, descrição e um preço válido.');
      return;
    }

    const duplicate = this.menu.products().some(item =>
      item.name.toLocaleLowerCase() === name.toLocaleLowerCase() && item.name !== draft.originalName);
    if (duplicate) {
      this.notifications.warning('Já existe um produto com esse nome no cardápio.');
      return;
    }

    const product: MenuItem = {
      name,
      desc: draft.desc.trim(),
      price: draft.price,
      image: draft.image.trim() || '/images/food-fallback.svg',
      tag: draft.tag.trim() || 'NOVO',
    };
    const items = [...this.menu.products()];
    const index = draft.originalName ? items.findIndex(item => item.name === draft.originalName) : -1;

    if (index >= 0) items[index] = product;
    else items.push(product);

    this.menu.save(items);
    this.closeProductDialog();
    this.notifications.success(draft.originalName ? 'Produto atualizado.' : 'Produto adicionado ao cardápio.');
  }

  confirmDelete(product: MenuItem): void {
    this.dialogClosing.set(false);
    this.editingProduct.set(null);
    this.productToDelete.set(product);
  }

  deleteProduct(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.menu.save(this.menu.products().filter(item => item.name !== product.name));
    this.closeDeleteDialog();
    this.notifications.success('Produto removido do cardápio.');
  }

  closeProductDialog(): void {
    this.closeWithAnimation(() => this.editingProduct.set(null));
  }

  closeDeleteDialog(): void {
    this.closeWithAnimation(() => this.productToDelete.set(null));
  }

  moveProduct(index: number): void {
    const from = this.draggedIndex();
    if (from === null || from === index) return;

    this.reorder(from, index);
    this.draggedIndex.set(null);
  }

  moveProductBy(index: number, delta: number): void {
    this.reorder(index, index + delta);
  }

  useFallback(event: Event): void {
    (event.target as HTMLImageElement).src = '/images/food-fallback.svg';
  }

  private closeWithAnimation(close: () => void): void {
    if (this.dialogClosing()) return;

    this.dialogClosing.set(true);
    window.setTimeout(() => {
      close();
      this.dialogClosing.set(false);
    }, 220);
  }

  private reorder(from: number, to: number): void {
    const items = [...this.menu.products()];
    if (to < 0 || to >= items.length || from === to) return;

    const previousPositions = new Map(
      Array.from(document.querySelectorAll<HTMLElement>('.catalog-product-row[data-product-name]'))
        .map(row => [row.dataset['productName'] ?? '', row.getBoundingClientRect()] as const),
    );
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    this.menu.save(items);

    requestAnimationFrame(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      document.querySelectorAll<HTMLElement>('.catalog-product-row[data-product-name]').forEach(row => {
        const previous = previousPositions.get(row.dataset['productName'] ?? '');
        if (!previous) return;

        const current = row.getBoundingClientRect();
        const offsetY = previous.top - current.top;
        if (offsetY) {
          row.animate(
            [{ transform: `translateY(${offsetY}px)` }, { transform: 'translateY(0)' }],
            { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' },
          );
        }
      });
    });

    this.notifications.success('Ordem da vitrine atualizada.');
  }
}
