import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountGroupNode } from '../../../../core/models/account-group.model';

@Component({
  selector: 'app-coa-tree-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-node-wrapper">
      <div class="node-header" [class.root-node]="node.path.indexOf('.') === -1">
        <div class="node-info" (click)="toggleExpand()">
          <span class="toggle-icon">
            @if (node.children.length > 0 || node.accounts.length > 0) {
              {{ node.isExpanded ? '▼' : '▶' }}
            } @else {
              •
            }
          </span>
          <span class="folder-icon">📁</span>
          <span class="node-code">{{ node.code }}</span>
          <span class="node-name">{{ node.name }}</span>
        </div>

        <div class="node-actions">
          <button 
            type="button" 
            (click)="addNode.emit({ parentId: node.id, parentPath: node.path })" 
            class="action-btn btn-add-group"
            title="Agregar subgrupo">
            ＋ Grupo
          </button>
          <button 
            type="button" 
            (click)="addAccount.emit({ groupId: node.id })" 
            class="action-btn btn-add-account"
            title="Agregar cuenta contable">
            ＋ Cuenta
          </button>
          <button 
            type="button" 
            (click)="deleteNode.emit(node.id)" 
            class="action-btn btn-delete-group"
            title="Eliminar grupo">
            ✕
          </button>
        </div>
      </div>

      <!-- Recursive Children & Leaf Accounts -->
      @if (node.isExpanded) {
        <div class="node-children">
          <!-- Render sub-groups recursively -->
          @for (child of node.children; track child.id) {
            <app-coa-tree-node 
              [node]="child"
              (addNode)="addNode.emit($event)"
              (addAccount)="addAccount.emit($event)"
              (deleteNode)="deleteNode.emit($event)">
            </app-coa-tree-node>
          }

          <!-- Render leaf accounts of this group -->
          @for (acc of node.accounts; track acc.id) {
            <div class="leaf-account">
              <span class="leaf-icon">📄</span>
              <span class="leaf-code">{{ acc.code }}</span>
              <span class="leaf-name">{{ acc.name }}</span>
              <span class="leaf-type badge" [ngClass]="'badge-' + acc.type.toLowerCase()">
                {{ acc.type }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .tree-node-wrapper {
      margin-bottom: 0.25rem;
    }
    .node-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
      transition: var(--transition-smooth);
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid transparent;
    }
    .node-header:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: var(--border-glass);
    }
    .root-node {
      background: rgba(99, 102, 241, 0.05);
      border: 1px solid rgba(99, 102, 241, 0.1);
      font-weight: 600;
    }
    .node-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      flex-grow: 1;
    }
    .toggle-icon {
      font-size: 0.75rem;
      color: var(--text-muted);
      width: 15px;
      text-align: center;
    }
    .folder-icon {
      font-size: 1rem;
    }
    .node-code {
      color: var(--color-primary);
      font-family: monospace;
      font-size: 0.95rem;
    }
    .node-name {
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    .node-actions {
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: var(--transition-smooth);
    }
    .node-header:hover .node-actions {
      opacity: 1;
    }
    .action-btn {
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      background: transparent;
      color: var(--text-secondary);
      transition: var(--transition-smooth);
      border: 1px solid var(--border-glass);
    }
    .btn-add-group:hover {
      color: var(--color-primary);
      background: rgba(99, 102, 241, 0.1);
      border-color: var(--color-primary);
    }
    .btn-add-account:hover {
      color: var(--color-success);
      background: var(--color-success-bg);
      border-color: var(--color-success);
    }
    .btn-delete-group:hover {
      color: var(--color-danger);
      background: var(--color-danger-bg);
      border-color: var(--color-danger);
    }
    .node-children {
      margin-left: 1.5rem;
      padding-left: 0.5rem;
      border-left: 1px dashed var(--border-glass);
      margin-top: 0.25rem;
    }
    .leaf-account {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      font-size: 0.9rem;
      border-radius: var(--radius-sm);
    }
    .leaf-account:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .leaf-icon {
      font-size: 0.9rem;
    }
    .leaf-code {
      color: var(--text-secondary);
      font-family: monospace;
    }
    .leaf-name {
      color: var(--text-secondary);
      flex-grow: 1;
    }
    .badge {
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
    }
    .badge-asset { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-liability { background: rgba(239, 68, 68, 0.1); color: #fb7185; border: 1px solid rgba(239, 68, 68, 0.2); }
    .badge-equity { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
    .badge-revenue { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
    .badge-expense { background: rgba(168, 85, 247, 0.1); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.2); }
  `]
})
export class CoaTreeNodeComponent {
  @Input({ required: true }) node!: AccountGroupNode;

  @Output() addNode = new EventEmitter<{ parentId: string; parentPath: string }>();
  @Output() addAccount = new EventEmitter<{ groupId: string }>();
  @Output() deleteNode = new EventEmitter<string>();

  toggleExpand() {
    this.node.isExpanded = !this.node.isExpanded;
  }
}
