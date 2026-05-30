import { Component, inject, signal, computed, Renderer2, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TranslationStateService } from '../../../core/services/translation-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { RbacService, PermissionResponse, RoleResponse, UserResponse } from '../../../core/services/rbac.service';

@Component({
  selector: 'app-settings-container',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoDirective],
  template: `
    <div class="settings-wrapper" *transloco="let t">
      <div class="settings-header">
        <h2>{{ t('settings.title') }}</h2>
      </div>

      <!-- Sub-tabs bar -->
      <div class="tabs-bar">
        <button 
          class="tab-btn" 
          [class.active]="activeSettingsTab() === 'general'" 
          (click)="setTab('general')">
          ⚙️ {{ t('settings.tab_general') }}
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeSettingsTab() === 'users'" 
          (click)="setTab('users')">
          👥 {{ t('settings.tab_users') }}
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeSettingsTab() === 'roles'" 
          (click)="setTab('roles')">
          🔑 {{ t('settings.tab_roles') }}
        </button>
      </div>

      <!-- Tab Content: GENERAL -->
      <div *ngIf="activeSettingsTab() === 'general'" class="settings-grid">
        <!-- i18n settings card -->
        <div class="settings-card glass-panel">
          <div class="card-header">
            <h3>🌐 {{ t('settings.language_section') }}</h3>
          </div>
          <div class="card-body">
            <p class="card-desc">{{ t('settings.language_desc') }}</p>
            <div class="control-group">
              <label for="langSelect">{{ t('settings.select_language') }}</label>
              <select 
                id="langSelect" 
                [ngModel]="translationState.activeLanguage()" 
                (ngModelChange)="onLanguageChange($event)"
                class="settings-select">
                <option value="en">English (EN)</option>
                <option value="es">Español (ES)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tenant info card -->
        <div class="settings-card glass-panel">
          <div class="card-header">
            <h3>🏢 {{ t('settings.tenant_section') }}</h3>
          </div>
          <div class="card-body">
            <p class="card-desc">{{ t('settings.tenant_desc') }}</p>
            <div class="info-row">
              <span class="info-label">ID:</span>
              <code class="info-value">{{ activeTenantId() }}</code>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('settings.tenant_name') }}:</span>
              <strong class="info-value">
                {{ activeTenantName() }}
              </strong>
            </div>
          </div>
        </div>

        <!-- UI theme customization card -->
        <div class="settings-card glass-panel">
          <div class="card-header">
            <h3>🎨 {{ t('settings.theme_section') }}</h3>
          </div>
          <div class="card-body">
            <p class="card-desc">{{ t('settings.theme_desc') }}</p>
            <div class="control-group">
              <button 
                type="button" 
                (click)="toggleTheme()" 
                class="btn btn-secondary btn-theme">
                {{ isDarkMode() ? '☀️ ' + t('settings.light_mode') : '🌙 ' + t('settings.dark_mode') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: USERS -->
      <div *ngIf="activeSettingsTab() === 'users'" class="users-section fade-in">
        <div class="section-header">
          <div class="header-text">
            <h3>👥 {{ t('settings.users_title') }}</h3>
            <p>{{ t('settings.users_desc') }}</p>
          </div>
          <button class="btn btn-primary" (click)="openCreateUserModal()">
            ➕ {{ t('settings.btn_create_user') }}
          </button>
        </div>

        <div class="table-container glass-panel">
          <table class="premium-table">
            <thead>
              <tr>
                <th>{{ t('settings.col_email') }}</th>
                <th>{{ t('settings.col_roles') }}</th>
                <th>{{ t('settings.col_status') }}</th>
                <th>{{ t('settings.col_actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users()">
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" *ngFor="let role of user.roles">{{ role.name }}</span>
                </td>
                <td>
                  <span class="status-indicator" [class.active]="user.status === 'ACTIVE'">
                    {{ user.status === 'ACTIVE' ? t('settings.status_active') : t('settings.status_inactive') }}
                  </span>
                </td>
                <td>
                  <button 
                    *ngIf="user.status === 'ACTIVE' && user.email !== currentUserEmail()"
                    class="btn btn-danger btn-sm" 
                    (click)="openFrictionModal(user, 'deactivate')">
                    🛑 {{ t('settings.btn_deactivate') }}
                  </button>
                  <button 
                    *ngIf="user.status === 'INACTIVE'"
                    class="btn btn-success btn-sm" 
                    (click)="openFrictionModal(user, 'reactivate')">
                    🔄 {{ t('settings.btn_reactivate') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Content: ROLES -->
      <div *ngIf="activeSettingsTab() === 'roles'" class="roles-section fade-in">
        <div class="roles-grid">
          <!-- Roles list -->
          <div class="roles-card glass-panel">
            <div class="card-header">
              <h3>🔑 {{ t('settings.roles_title') }}</h3>
              <p class="card-desc">{{ t('settings.roles_desc') }}</p>
            </div>
            <div class="roles-list">
              <div 
                *ngFor="let role of roles()" 
                class="role-item-row"
                [class.selected]="selectedRole()?.id === role.id"
                (click)="selectRole(role)">
                <div class="role-item-info">
                  <strong>{{ role.name }}</strong>
                  <span>{{ role.description }}</span>
                </div>
                <button class="btn btn-secondary btn-xs" (click)="selectRole(role); $event.stopPropagation()">
                  ✏️
                </button>
              </div>
            </div>
          </div>

          <!-- Role Form (Create / Edit) -->
          <div class="roles-card glass-panel">
            <div class="card-header">
              <h3>
                {{ selectedRole() ? t('settings.btn_edit_role') : t('settings.btn_create_role') }}
              </h3>
            </div>
            <form (submit)="saveRole($event)" class="role-form">
              <div class="form-group">
                <label for="roleName">{{ t('settings.role_name') }}</label>
                <input 
                  id="roleName"
                  type="text" 
                  [(ngModel)]="roleForm.name" 
                  name="roleName" 
                  required 
                  class="settings-input" />
              </div>
              <div class="form-group">
                <label for="roleDesc">{{ t('settings.role_desc') }}</label>
                <input 
                  id="roleDesc"
                  type="text" 
                  [(ngModel)]="roleForm.description" 
                  name="roleDesc" 
                  class="settings-input" />
              </div>
              
              <div class="form-group">
                <label>{{ t('settings.tab_roles') }} / Permisos</label>
                <div class="permissions-checklist">
                  <div *ngFor="let perm of permissions()" class="checkbox-row">
                    <input 
                      type="checkbox" 
                      [id]="'perm-' + perm.id" 
                      [checked]="hasPermission(perm.id)"
                      (change)="togglePermission(perm.id)"
                      class="toggle-input" />
                    <label [for]="'perm-' + perm.id" class="toggle-switch-label"></label>
                    <div class="permission-text-info">
                      <strong>{{ perm.name }}</strong>
                      <span class="perm-desc">{{ perm.description }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="resetRoleForm()">
                  {{ t('coa.cancel') }}
                </button>
                <button type="submit" class="btn btn-primary">
                  💾 {{ selectedRole() ? t('settings.btn_edit_role') : t('settings.btn_create_role') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal: Create User -->
      <div *ngIf="isCreateUserModalOpen()" class="modal-overlay">
        <div class="modal-card glass-panel fade-in">
          <div class="modal-header">
            <h4>{{ t('settings.create_user_title') }}</h4>
          </div>
          <form (submit)="createUser($event)" class="modal-form">
            <div class="form-group">
              <label for="userEmail">{{ t('settings.create_user_email') }}</label>
              <input 
                id="userEmail"
                type="email" 
                [(ngModel)]="userForm.email" 
                name="userEmail" 
                required 
                class="settings-input" />
            </div>
            <div class="form-group">
              <label for="userRole">{{ t('settings.create_user_role') }}</label>
              <select 
                id="userRole" 
                [(ngModel)]="userForm.roleId" 
                name="userRole" 
                required 
                class="settings-select">
                <option value="">-- {{ t('settings.create_user_role') }} --</option>
                <option *ngFor="let role of roles()" [value]="role.id">{{ role.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="userPassword">{{ t('settings.create_user_password') }}</label>
              <input 
                id="userPassword"
                type="password" 
                [(ngModel)]="userForm.password" 
                name="userPassword" 
                class="settings-input" />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeCreateUserModal()">
                {{ t('settings.modal_cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                💾 {{ t('settings.btn_create_user') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal: Friction Action (Password + Reason Verification) -->
      <div *ngIf="isFrictionModalOpen()" class="modal-overlay">
        <div class="modal-card glass-panel fade-in">
          <div class="modal-header">
            <h4>
              {{ frictionAction() === 'deactivate' ? t('settings.modal_deactivate_title') : t('settings.modal_reactivate_title') }}
            </h4>
            <p class="target-email">{{ targetUser()?.email }}</p>
          </div>
          <form (submit)="submitFrictionAction($event)" class="modal-form">
            <div class="form-group">
              <label for="adminPass">{{ t('settings.modal_password') }}</label>
              <input 
                id="adminPass"
                type="password" 
                [(ngModel)]="frictionForm.adminPassword" 
                name="adminPass" 
                required 
                class="settings-input" />
            </div>
            <div class="form-group">
              <label for="reason">{{ t('settings.modal_reason') }}</label>
              <textarea 
                id="reason"
                [(ngModel)]="frictionForm.reason" 
                name="reason" 
                required 
                rows="3" 
                class="settings-textarea"></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeFrictionModal()">
                {{ t('settings.modal_cancel') }}
              </button>
              <button type="submit" class="btn btn-danger">
                🔒 {{ t('settings.modal_confirm') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .settings-wrapper {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .settings-header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    /* Tabs styling */
    .tabs-bar {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.25rem;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0.6rem 1.25rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      border-radius: 8px 8px 0 0;
      transition: var(--transition-smooth);
    }
    .tab-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.03);
    }
    .tab-btn.active {
      color: #6366f1;
      border-bottom: 2px solid #6366f1;
      background: rgba(99, 102, 241, 0.05);
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .settings-card, .roles-card {
      padding: 1.5rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
    }
    .card-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }
    .control-group, .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .control-group label, .form-group label {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 500;
    }
    .settings-select, .settings-input, .settings-textarea {
      background: rgba(15, 23, 42, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: #ffffff;
      padding: 0.6rem 1rem;
      font-size: 0.95rem;
      outline: none;
      transition: var(--transition-smooth);
      font-family: var(--font-family);
    }
    .settings-textarea {
      resize: vertical;
    }
    .settings-select:focus, .settings-input:focus, .settings-textarea:focus {
      border-color: #6366f1;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
    }
    .settings-select option {
      background-color: var(--bg-secondary);
      color: #ffffff;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.9rem;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #94a3b8;
    }
    .info-value {
      color: #ffffff;
    }
    code.info-value {
      font-family: monospace;
      font-size: 0.8rem;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    .btn {
      padding: 0.6rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: var(--transition-smooth);
      font-family: var(--font-family);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary {
      background: #6366f1;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #4f46e5;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #ffffff;
    }
    .btn-success {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }
    .btn-success:hover {
      background: rgba(34, 197, 94, 0.3);
      color: #ffffff;
    }
    .btn-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 6px;
    }
    .btn-xs {
      padding: 0.2rem 0.4rem;
      font-size: 0.75rem;
      border-radius: 4px;
    }
    .btn-theme {
      width: 100%;
      justify-content: center;
    }

    /* Section animations */
    .fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Users Tab styling */
    .users-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-header h3 {
      margin: 0;
      color: #ffffff;
      font-size: 1.25rem;
    }
    .section-header p {
      margin: 0.25rem 0 0 0;
      color: #94a3b8;
      font-size: 0.85rem;
    }
    
    .table-container {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      overflow-x: auto;
    }
    .premium-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .premium-table th {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-weight: 600;
    }
    .premium-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #f1f5f9;
      vertical-align: middle;
    }
    .premium-table tr:hover {
      background: rgba(255, 255, 255, 0.01);
    }
    .role-badge {
      display: inline-block;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      margin-right: 0.25rem;
    }
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .status-indicator.active {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }

    /* Roles Tab styling */
    .roles-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 1.5rem;
    }
    .roles-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .role-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1.5px solid rgba(255, 255, 255, 0.04);
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .role-item-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.08);
    }
    .role-item-row.selected {
      background: rgba(99, 102, 241, 0.08);
      border-color: #6366f1;
    }
    .role-item-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      text-align: left;
    }
    .role-item-info strong {
      color: #f8fafc;
      font-size: 0.9rem;
    }
    .role-item-info span {
      color: #64748b;
      font-size: 0.75rem;
    }

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-align: left;
    }
    .permissions-checklist {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      background: rgba(15, 23, 42, 0.25);
      border: 1.5px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 1rem;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.8rem;
      color: #cbd5e1;
    }
    .toggle-input {
      opacity: 0;
      position: absolute;
      width: 0;
      height: 0;
    }
    .toggle-switch-label {
      position: relative;
      display: inline-block;
      width: 38px;
      height: 20px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    .toggle-switch-label::after {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #ffffff;
      top: 2px;
      left: 2px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .toggle-input:checked + .toggle-switch-label {
      background: #10b981;
      border-color: #10b981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
    }
    .toggle-input:checked + .toggle-switch-label::after {
      transform: translateX(18px);
    }
    .permission-text-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      text-align: left;
    }
    .permission-text-info strong {
      color: #f8fafc;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .permission-text-info .perm-desc {
      color: #94a3b8;
      font-size: 0.72rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    /* Modal dialog styling */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-card {
      width: 100%;
      max-width: 450px;
      padding: 2rem;
      background: var(--bg-glass);
      backdrop-filter: blur(25px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .modal-header h4 {
      margin: 0;
      font-size: 1.15rem;
      color: #ffffff;
      font-weight: 600;
    }
    .target-email {
      margin: 0.25rem 0 0 0;
      color: #6366f1;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: monospace;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      text-align: left;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
  `]
})
export class SettingsContainerComponent implements OnInit {
  translationState = inject(TranslationStateService);
  private authService = inject(AuthService);
  private rbacService = inject(RbacService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  
  private _darkMode = signal<boolean>(true);
  
  // Navigation internal state
  activeSettingsTab = signal<'general' | 'users' | 'roles'>('general');

  // Load backend Signals
  users = this.rbacService.users;
  roles = this.rbacService.roles;
  permissions = this.rbacService.permissions;

  // Selected details
  activeTenantId = computed(() => this.authService.currentUser()?.tenantId || 'N/A');
  currentUserEmail = computed(() => this.authService.currentUser()?.email || '');
  
  activeTenantName = computed(() => {
    const email = this.currentUserEmail();
    if (!email) return 'AequiVault';
    const domainPart = email.split('@')[1];
    if (!domainPart) return 'AequiVault Tenant';
    const company = domainPart.split('.')[0];
    return company.charAt(0).toUpperCase() + company.slice(1);
  });

  // Modal Open states
  isCreateUserModalOpen = signal<boolean>(false);
  isFrictionModalOpen = signal<boolean>(false);

  // Forms
  roleForm = {
    name: '',
    description: '',
    permissionIds: [] as string[]
  };
  selectedRole = signal<RoleResponse | null>(null);

  userForm = {
    email: '',
    roleId: '',
    password: ''
  };

  targetUser = signal<UserResponse | null>(null);
  frictionAction = signal<'deactivate' | 'reactivate' | null>(null);
  frictionForm = {
    adminPassword: '',
    reason: ''
  };

  ngOnInit() {
    this.loadRbacData();
  }

  loadRbacData() {
    this.rbacService.loadPermissions().subscribe();
    this.rbacService.loadRoles().subscribe();
    this.rbacService.loadUsers().subscribe();
  }

  setTab(tab: 'general' | 'users' | 'roles') {
    this.activeSettingsTab.set(tab);
    if (tab !== 'general') {
      this.loadRbacData();
    }
  }

  onLanguageChange(lang: 'en' | 'es') {
    this.translationState.setLanguage(lang);
  }

  isDarkMode() {
    return this._darkMode();
  }

  toggleTheme() {
    this._darkMode.update(val => !val);
    const body = this.document.body;
    if (this._darkMode()) {
      this.renderer.removeClass(body, 'light-theme');
      this.renderer.addClass(body, 'dark-theme');
    } else {
      this.renderer.removeClass(body, 'dark-theme');
      this.renderer.addClass(body, 'light-theme');
    }
  }

  // --- ROLES MANAGEMENT ---
  selectRole(role: RoleResponse) {
    this.selectedRole.set(role);
    this.roleForm = {
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map(p => p.id)
    };
  }

  hasPermission(permId: string): boolean {
    return this.roleForm.permissionIds.includes(permId);
  }

  togglePermission(permId: string) {
    const index = this.roleForm.permissionIds.indexOf(permId);
    if (index > -1) {
      this.roleForm.permissionIds.splice(index, 1);
    } else {
      this.roleForm.permissionIds.push(permId);
    }
  }

  resetRoleForm() {
    this.selectedRole.set(null);
    this.roleForm = {
      name: '',
      description: '',
      permissionIds: []
    };
  }

  saveRole(event: Event) {
    event.preventDefault();
    if (!this.roleForm.name || this.roleForm.permissionIds.length === 0) return;

    const req = {
      name: this.roleForm.name,
      description: this.roleForm.description,
      permissionIds: this.roleForm.permissionIds
    };

    const activeRole = this.selectedRole();
    if (activeRole) {
      this.rbacService.updateRole(activeRole.id, req).subscribe({
        next: () => this.resetRoleForm(),
        error: (err) => console.error('Error updating role', err)
      });
    } else {
      this.rbacService.createRole(req).subscribe({
        next: () => this.resetRoleForm(),
        error: (err) => console.error('Error creating role', err)
      });
    }
  }

  // --- CREATE USER MODAL ---
  openCreateUserModal() {
    this.userForm = {
      email: '',
      roleId: '',
      password: ''
    };
    this.isCreateUserModalOpen.set(true);
  }

  closeCreateUserModal() {
    this.isCreateUserModalOpen.set(false);
  }

  createUser(event: Event) {
    event.preventDefault();
    if (!this.userForm.email || !this.userForm.roleId) return;

    const req = {
      email: this.userForm.email,
      password: this.userForm.password,
      roleIds: [this.userForm.roleId]
    };

    this.rbacService.createUser(req).subscribe({
      next: () => this.closeCreateUserModal(),
      error: (err) => console.error('Error creating user', err)
    });
  }

  // --- FRICTION SECURITY MODAL (Soft-Delete) ---
  openFrictionModal(user: UserResponse, action: 'deactivate' | 'reactivate') {
    this.targetUser.set(user);
    this.frictionAction.set(action);
    this.frictionForm = {
      adminPassword: '',
      reason: ''
    };
    this.isFrictionModalOpen.set(true);
  }

  closeFrictionModal() {
    this.isFrictionModalOpen.set(false);
    this.targetUser.set(null);
    this.frictionAction.set(null);
  }

  submitFrictionAction(event: Event) {
    event.preventDefault();
    const user = this.targetUser();
    const action = this.frictionAction();
    if (!user || !action || !this.frictionForm.adminPassword || !this.frictionForm.reason) return;

    const req = {
      adminPassword: this.frictionForm.adminPassword,
      reason: this.frictionForm.reason
    };

    if (action === 'deactivate') {
      this.rbacService.deactivateUser(user.id, req).subscribe({
        next: () => this.closeFrictionModal(),
        error: (err) => console.error('Error deactivating user', err)
      });
    } else {
      this.rbacService.reactivateUser(user.id, req).subscribe({
        next: () => this.closeFrictionModal(),
        error: (err) => console.error('Error reactivating user', err)
      });
    }
  }
}
