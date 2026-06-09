import {
  Component, OnInit, signal, inject, Output, EventEmitter
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService } from '../../../../core/services/journal.service';
import { JournalEntryResponse } from '../../../../core/models/journal-entry.model';

@Component({
  selector: 'app-journal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="journal-list-container">

      <!-- Filter Bar -->
      <div class="filter-bar glass-panel">
        <div class="filter-group">
          <label class="filter-label">Estado</label>
          <select class="filter-select" id="filter-status" [(ngModel)]="filterStatus" (change)="onFilterChange()">
            <option value="">Todos</option>
            <option value="DRAFT">Borrador</option>
            <option value="POSTED">Publicado</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Desde</label>
          <input type="date" class="filter-input" id="filter-from" [(ngModel)]="filterFrom" (change)="onFilterChange()" />
        </div>
        <div class="filter-group">
          <label class="filter-label">Hasta</label>
          <input type="date" class="filter-input" id="filter-to" [(ngModel)]="filterTo" (change)="onFilterChange()" />
        </div>
        <div class="filter-group filter-search">
          <label class="filter-label">Buscar</label>
          <input type="text" class="filter-input" id="filter-query"
            placeholder="Descripción o número..." [(ngModel)]="filterQuery" (input)="onQueryInput()" />
        </div>
        <button class="btn-clear" id="btn-clear-filters" (click)="clearFilters()">Limpiar</button>
      </div>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <span>Cargando asientos...</span>
        </div>
      }

      <!-- Table -->
      @if (!isLoading()) {
        <div class="table-wrapper glass-panel">
          <table class="entries-table" id="journal-entries-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Moneda</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (entries().length === 0) {
                <tr>
                  <td colspan="6" class="empty-state">
                    <span class="empty-icon">📋</span>
                    <span>No se encontraron asientos</span>
                  </td>
                </tr>
              }
              @for (entry of entries(); track entry.id) {
                <tr class="entry-row" [class.draft-row]="entry.status === 'DRAFT'">
                  <td class="entry-number">{{ entry.entryNumber || '—' }}</td>
                  <td class="entry-date">{{ entry.date | date:'dd/MM/yyyy' }}</td>
                  <td class="entry-description" [title]="entry.description">{{ entry.description }}</td>
                  <td>
                    <span class="status-badge"
                      [class.status-draft]="entry.status === 'DRAFT'"
                      [class.status-posted]="entry.status === 'POSTED'">
                      {{ entry.status === 'DRAFT' ? 'Borrador' : 'Publicado' }}
                    </span>
                  </td>
                  <td class="entry-currency">{{ entry.currency }}</td>
                  <td class="entry-actions">
                    @if (entry.status === 'DRAFT') {
                      <button class="btn-action btn-edit"
                        id="edit-draft-{{ entry.id }}"
                        (click)="onEditDraft(entry)" title="Editar borrador">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                      </button>
                      <button class="btn-action btn-publish"
                        id="publish-draft-{{ entry.id }}"
                        (click)="onPublishDraft(entry)" title="Publicar borrador">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Publicar
                      </button>
                    }
                    @if (entry.status === 'POSTED') {
                      <button class="btn-action btn-view"
                        id="view-entry-{{ entry.id }}"
                        (click)="onViewEntry(entry)" title="Ver asiento">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Ver
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination-bar">
            <button class="btn-page" id="btn-prev-page"
              [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">
              ‹ Anterior
            </button>
            <span class="page-info">
              Página {{ currentPage() + 1 }} de {{ totalPages() }} · {{ totalElements() }} asientos
            </span>
            <button class="btn-page" id="btn-next-page"
              [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)">
              Siguiente ›
            </button>
          </div>
        } @else {
          <div class="results-count">{{ totalElements() }} asiento(s) encontrado(s)</div>
        }
      }
    </div>
  `,
  styles: [`
    .journal-list-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .filter-bar {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      padding: 1rem 1.25rem;
      flex-wrap: wrap;
      border-radius: 12px;
    }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-label {
      font-size: 0.68rem;
      color: var(--color-text-muted, #888);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }
    .filter-input, .filter-select {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--color-text-primary, #e2e8f0);
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      font-size: 0.85rem;
      min-width: 130px;
      transition: border-color 0.15s;
    }
    .filter-input:focus, .filter-select:focus {
      outline: none;
      border-color: rgba(99,102,241,0.5);
    }
    .filter-search { flex: 1; min-width: 200px; }
    .filter-search .filter-input { width: 100%; box-sizing: border-box; }
    .btn-clear {
      padding: 0.4rem 1rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--color-text-muted, #888);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
      align-self: flex-end;
    }
    .btn-clear:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .loading-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem;
      color: var(--color-text-muted, #888);
    }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.08);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .table-wrapper { border-radius: 12px; overflow: hidden; }
    .entries-table { width: 100%; border-collapse: collapse; }
    .entries-table th {
      padding: 0.7rem 1rem;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted, #888);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      white-space: nowrap;
    }
    .entries-table td {
      padding: 0.7rem 1rem;
      font-size: 0.875rem;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      color: var(--color-text-primary, #e2e8f0);
    }
    .entry-row { transition: background 0.12s; }
    .entry-row:hover { background: rgba(255,255,255,0.025); }
    .draft-row { border-left: 3px solid rgba(251,191,36,0.4); }
    .entry-number { font-family: 'Courier New', monospace; color: #a78bfa; font-size: 0.8rem; }
    .entry-date { color: var(--color-text-muted, #888); font-size: 0.82rem; white-space: nowrap; }
    .entry-description {
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .entry-currency { font-size: 0.8rem; color: #34d399; font-weight: 600; }
    .entry-actions { display: flex; gap: 0.35rem; }
    .status-badge {
      display: inline-block;
      padding: 0.18rem 0.55rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .status-draft { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .status-posted { background: rgba(52,211,153,0.12); color: #34d399; }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.28rem 0.6rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .btn-edit {
      background: rgba(99,102,241,0.12);
      color: #818cf8;
      border-color: rgba(99,102,241,0.22);
    }
    .btn-edit:hover { background: rgba(99,102,241,0.22); }
    .btn-publish {
      background: rgba(52,211,153,0.12);
      color: #34d399;
      border-color: rgba(52,211,153,0.22);
    }
    .btn-publish:hover { background: rgba(52,211,153,0.22); }
    .btn-view {
      background: rgba(148,163,184,0.08);
      color: #94a3b8;
      border-color: rgba(148,163,184,0.18);
    }
    .btn-view:hover { background: rgba(148,163,184,0.16); }
    .empty-state {
      text-align: center !important;
      padding: 3rem !important;
      color: var(--color-text-muted, #888);
    }
    .empty-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 0.5rem 0;
    }
    .btn-page {
      padding: 0.38rem 1rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--color-text-primary, #e2e8f0);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.82rem;
      transition: all 0.15s;
    }
    .btn-page:hover:not([disabled]) { background: rgba(255,255,255,0.1); }
    .btn-page[disabled] { opacity: 0.3; cursor: not-allowed; }
    .page-info { font-size: 0.8rem; color: var(--color-text-muted, #888); }
    .results-count {
      text-align: center;
      font-size: 0.78rem;
      color: var(--color-text-muted, #888);
      padding: 0.25rem 0;
    }
  `]
})
export class JournalListComponent implements OnInit {
  private journalService = inject(JournalService);

  @Output() editDraft   = new EventEmitter<JournalEntryResponse>();
  @Output() publishDraft = new EventEmitter<JournalEntryResponse>();
  @Output() viewEntry   = new EventEmitter<JournalEntryResponse>();

  entries       = signal<JournalEntryResponse[]>([]);
  isLoading     = signal<boolean>(false);
  currentPage   = signal<number>(0);
  totalPages    = signal<number>(0);
  totalElements = signal<number>(0);

  filterStatus = '';
  filterFrom   = '';
  filterTo     = '';
  filterQuery  = '';
  private queryTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.isLoading.set(true);
    this.journalService.listEntries({
      status: this.filterStatus || undefined,
      from:   this.filterFrom   || undefined,
      to:     this.filterTo     || undefined,
      q:      this.filterQuery  || undefined,
      page:   this.currentPage(),
      size:   20
    }).subscribe({
      next: (res) => {
        this.entries.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadEntries();
  }

  onQueryInput(): void {
    if (this.queryTimeout) clearTimeout(this.queryTimeout);
    this.queryTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadEntries();
    }, 400);
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterFrom   = '';
    this.filterTo     = '';
    this.filterQuery  = '';
    this.currentPage.set(0);
    this.loadEntries();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadEntries();
  }

  onEditDraft(entry: JournalEntryResponse):   void { this.editDraft.emit(entry); }
  onPublishDraft(entry: JournalEntryResponse): void { this.publishDraft.emit(entry); }
  onViewEntry(entry: JournalEntryResponse):   void { this.viewEntry.emit(entry); }
}
