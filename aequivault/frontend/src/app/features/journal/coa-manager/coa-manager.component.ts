import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { AccountService } from '../../../core/services/account.service';
import { AccountGroupDto, AccountGroupNode, AccountGroupRequest } from '../../../core/models/account-group.model';
import { LedgerAccountDto } from '../../../core/models/ledger-account.model';
import { CoaTreeNodeComponent } from '../components/coa-tree-node/coa-tree-node.component';

@Component({
  selector: 'app-coa-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, CoaTreeNodeComponent, TranslocoDirective],
  template: `
    <div class="coa-card glass-panel" *transloco="let t">
      <div class="coa-header">
        <h2>{{ t('coa.title') }}</h2>
        <button type="button" (click)="openAddRootGroupModal()" class="btn btn-primary btn-sm">
          ＋ {{ t('coa.root_group') }}
        </button>
      </div>

      <!-- Local Alert/Notification -->
      @if (errorMsg()) {
        <div class="error-banner">
          <span>⚠️ {{ t(errorMsg()) }}</span>
          <button (click)="errorMsg.set('')" class="btn-close">✕</button>
        </div>
      }

      <div class="tree-container">
        @if (isLoading()) {
          <div class="loading-state">{{ t('coa.loading') }}</div>
        } @else if (rootNodes().length === 0) {
          <div class="empty-state">{{ t('coa.empty_state') }}</div>
        } @else {
          @for (node of rootNodes(); track node.id) {
            <app-coa-tree-node 
              [node]="node"
              (addNode)="openAddSubgroupModal($event)"
              (addAccount)="openAddAccountModal($event)"
              (deleteNode)="onDeleteGroup($event)">
            </app-coa-tree-node>
          }
        }
      </div>

      <!-- Modal: Agregar Grupo -->
      @if (activeModal() === 'group') {
        <div class="modal-overlay">
          <div class="modal-content glass-panel">
            <h3>{{ groupFormParentPath() ? t('coa.create_subgroup', { path: groupFormParentPath() }) : t('coa.create_root_group') }}</h3>
            <form (ngSubmit)="onCreateGroup()" #groupForm="ngForm">
              <div class="form-group">
                <label for="groupCode">{{ t('coa.group_code') }}</label>
                <input 
                  id="groupCode" 
                  type="text" 
                  [(ngModel)]="groupFormModel.code" 
                  name="code" 
                  required 
                  pattern="^[a-zA-Z0-9]+$"
                  [placeholder]="t('coa.group_code_placeholder')" />
              </div>
              <div class="form-group">
                <label for="groupName">{{ t('coa.group_name') }}</label>
                <input 
                  id="groupName" 
                  type="text" 
                  [(ngModel)]="groupFormModel.name" 
                  name="name" 
                  required 
                  [placeholder]="t('coa.group_name_placeholder')" />
              </div>
              <div class="modal-actions">
                <button type="button" (click)="closeModal()" class="btn btn-secondary">{{ t('coa.cancel') }}</button>
                <button type="submit" [disabled]="!groupForm.valid || isSubmitting()" class="btn btn-primary">
                  {{ isSubmitting() ? t('coa.saving') : t('coa.create_group') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal: Agregar Cuenta de Mayor -->
      @if (activeModal() === 'account') {
        <div class="modal-overlay">
          <div class="modal-content glass-panel">
            <h3>{{ t('coa.add_account_title') }}</h3>
            <form (ngSubmit)="onCreateAccount()" #accountForm="ngForm">
              <div class="form-group">
                <label for="accCode">{{ t('coa.acc_code') }}</label>
                <input 
                  id="accCode" 
                  type="text" 
                  [(ngModel)]="accountFormModel.code" 
                  name="code" 
                  required 
                  [placeholder]="t('coa.acc_code_placeholder')" />
              </div>
              <div class="form-group">
                <label for="accName">{{ t('coa.acc_name') }}</label>
                <input 
                  id="accName" 
                  type="text" 
                  [(ngModel)]="accountFormModel.name" 
                  name="name" 
                  required 
                  [placeholder]="t('coa.acc_name_placeholder')" />
              </div>
              <div class="form-group">
                <label for="accType">{{ t('coa.acc_type') }}</label>
                <select id="accType" [(ngModel)]="accountFormModel.type" name="type" required>
                  <option value="ASSET">ASSET ({{ t('coa.acc_types.asset') }})</option>
                  <option value="LIABILITY">LIABILITY ({{ t('coa.acc_types.liability') }})</option>
                  <option value="EQUITY">EQUITY ({{ t('coa.acc_types.equity') }})</option>
                  <option value="REVENUE">REVENUE ({{ t('coa.acc_types.revenue') }})</option>
                  <option value="EXPENSE">EXPENSE ({{ t('coa.acc_types.expense') }})</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" (click)="closeModal()" class="btn btn-secondary">{{ t('coa.cancel') }}</button>
                <button type="submit" [disabled]="!accountForm.valid || isSubmitting()" class="btn btn-primary">
                  {{ isSubmitting() ? t('coa.saving') : t('coa.create_account') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .coa-card {
      margin-top: 1.5rem;
    }
    .coa-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .coa-header h2 {
      margin: 0;
    }
    .tree-container {
      background: rgba(15, 23, 42, 0.3);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      min-height: 250px;
    }
    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    
    /* Error Banner */
    .error-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--color-danger-bg);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .btn-close {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.95rem;
    }

    /* Modal Overlay & Card styling */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      width: 100%;
      max-width: 480px;
      padding: 2rem;
      margin: 0 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .modal-content h3 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .form-group {
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 2rem;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class CoaManagerComponent implements OnInit {
  @Input({ required: true }) tenantId = '212f7927-ed0d-495c-b39b-94364d5e2f9b';
  @Output() catalogChanged = new EventEmitter<void>(); // Emit when COA changes to update the selection list

  rootNodes = signal<AccountGroupNode[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMsg = signal<string>('');

  // Modals state
  activeModal = signal<'group' | 'account' | null>(null);
  groupFormParentPath = signal<string>('');

  // Form Models
  groupFormModel = {
    parentId: null as string | null,
    code: '',
    name: ''
  };

  accountFormModel = {
    groupId: '',
    code: '',
    name: '',
    type: 'ASSET' as 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  };

  constructor(
    private accountService: AccountService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit() {
    this.loadChartOfAccounts();
  }

  // Reload tree when tenantId Input changes
  ngOnChanges() {
    this.loadChartOfAccounts();
  }

  loadChartOfAccounts() {
    this.isLoading.set(true);
    this.errorMsg.set('');

    // Fetch groups and accounts in parallel
    this.accountService.getGroups(this.tenantId).subscribe({
      next: (groups) => {
        this.accountService.getAccounts(this.tenantId).subscribe({
          next: (accounts) => {
            this.reconstructTree(groups, accounts);
            this.isLoading.set(false);
          },
          error: () => {
            this.errorMsg.set('coa.errors.load_accounts');
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.errorMsg.set('coa.errors.load_groups');
        this.isLoading.set(false);
      }
    });
  }

  reconstructTree(groups: AccountGroupDto[], accounts: LedgerAccountDto[]) {
    // 1. Build path index map
    const nodeMap = new Map<string, AccountGroupNode>();
    const rootList: AccountGroupNode[] = [];

    // 2. Map groups to tree nodes
    groups.forEach(g => {
      const node: AccountGroupNode = {
        id: g.id,
        code: g.code,
        name: g.name,
        path: g.path,
        children: [],
        accounts: [],
        isExpanded: true
      };
      nodeMap.set(g.path, node);
    });

    // 3. Nest children under parent paths
    groups.forEach(g => {
      const node = nodeMap.get(g.path)!;
      const dotIndex = g.path.lastIndexOf('.');

      if (dotIndex === -1) {
        rootList.push(node);
      } else {
        const parentPath = g.path.substring(0, dotIndex);
        const parentNode = nodeMap.get(parentPath);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // If parent group is not visible due to RLS filter mismatch, keep it as root
          rootList.push(node);
        }
      }
    });

    // 4. Nest accounts under their group nodes (using group ID mapping)
    const idMap = new Map<string, AccountGroupNode>();
    nodeMap.forEach(node => {
      idMap.set(node.id, node);
    });

    accounts.forEach(acc => {
      const groupNode = idMap.get(acc.groupId);
      if (groupNode) {
        groupNode.accounts.push(acc);
      }
    });

    this.rootNodes.set(rootList);
  }

  openAddRootGroupModal() {
    this.groupFormParentPath.set('');
    this.groupFormModel = {
      parentId: null,
      code: '',
      name: ''
    };
    this.activeModal.set('group');
  }

  openAddSubgroupModal(event: { parentId: string; parentPath: string }) {
    this.groupFormParentPath.set(event.parentPath);
    this.groupFormModel = {
      parentId: event.parentId,
      code: '',
      name: ''
    };
    this.activeModal.set('group');
  }

  openAddAccountModal(event: { groupId: string }) {
    this.accountFormModel = {
      groupId: event.groupId,
      code: '',
      name: '',
      type: 'ASSET'
    };
    this.activeModal.set('account');
  }

  closeModal() {
    this.activeModal.set(null);
  }

  onCreateGroup() {
    this.isSubmitting.set(true);
    this.errorMsg.set('');

    const request: AccountGroupRequest = {
      parentId: this.groupFormModel.parentId || undefined,
      code: this.groupFormModel.code,
      name: this.groupFormModel.name
    };

    this.accountService.createGroup(request, this.tenantId).subscribe({
      next: () => {
        this.loadChartOfAccounts();
        this.closeModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.error && err.error.detail) {
          this.errorMsg.set(err.error.detail);
        } else {
          this.errorMsg.set('coa.errors.create_group');
        }
      }
    });
  }

  onCreateAccount() {
    this.isSubmitting.set(true);
    this.errorMsg.set('');

    const newAccount: LedgerAccountDto = {
      id: crypto.randomUUID(),
      groupId: this.accountFormModel.groupId,
      code: this.accountFormModel.code,
      name: this.accountFormModel.name,
      type: this.accountFormModel.type
    };

    this.accountService.createAccount(newAccount, this.tenantId).subscribe({
      next: () => {
        this.loadChartOfAccounts();
        this.catalogChanged.emit(); // Notify sibling selector components
        this.closeModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.error && err.error.detail) {
          this.errorMsg.set(err.error.detail);
        } else {
          this.errorMsg.set('coa.errors.create_account');
        }
      }
    });
  }

  onDeleteGroup(id: string) {
    const msg = this.translocoService.translate('coa.confirm_delete_group');
    if (!confirm(msg)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.accountService.deleteGroup(id, this.tenantId).subscribe({
      next: () => {
        this.loadChartOfAccounts();
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && err.error.detail) {
          this.errorMsg.set(err.error.detail);
        } else {
          this.errorMsg.set('coa.errors.delete_group');
        }
      }
    });
  }
}
